import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Fase 2 del plan de estabilidad: "modo sesión".
 *
 * Problema: votos/asistencias comparten el MISMO proceso Node y el MISMO pool
 * de conexiones con reportes y estadísticas históricas que consultan otros
 * sistemas (página del Congreso, SIPresidencia, inteligencia...). Si varias
 * de esas consultas pesadas llegan justo mientras 75 diputados votan, acaparan
 * conexiones/CPU y el voto hace fila.
 *
 * Solución: SOLO mientras haya una asistencia o votación abierta,
 *  1. Las consultas pesadas GET responden desde caché (por URL + usuario).
 *     Son datos históricos: unos minutos de antigüedad no importan.
 *  2. Las consultas pesadas (GET y POST) tienen un tope de cuántas pueden
 *     correr a la vez; el resto espera turno y, si tarda demasiado, recibe
 *     503 con Retry-After en lugar de saturar al servidor.
 * Al cerrar la votación todo vuelve a funcionar exactamente como antes.
 *
 * Las rutas EN VIVO (votos del punto, asistencia, orden del día, agenda que
 * consulta Presidencia, etc.) NUNCA pasan por aquí: no están en la lista
 * de pesadas, o están explícitamente excluidas abajo.
 */

// Rutas pesadas/históricas (prefijos). Ajustar aquí si aparecen otras.
const PESADAS = [
    '/api/reporte/',
    '/api/estadistico/iniciativas/',
    '/api/estadistico/diputado/',
    '/api/estadistico/comision/',
    '/api/estadistico/getordenes',
    '/api/inteligencia/',
    '/api/iniciativas/iniciativas/',
];

// Aunque caigan en un prefijo de arriba, estas reflejan lo que pasa EN VIVO
// en la sesión y deben responder siempre fresco y sin fila.
const EN_VIVO = [
    '/api/inteligencia/sesion/votacion/',
    '/api/inteligencia/eventos/recientes/',
];

const TTL_MS = Number(process.env.MODO_SESION_CACHE_TTL_MS) || 10 * 60 * 1000;
const MAX_CONCURRENTES = Number(process.env.MODO_SESION_MAX_CONCURRENTES) || 3;
const ESPERA_MAX_MS = Number(process.env.MODO_SESION_ESPERA_MAX_MS) || 20000;
const MAX_ENTRADAS_CACHE = 300;
// Respuestas más grandes que esto no se cachean (no llenar la RAM).
const MAX_BYTES_RESPUESTA = 5 * 1024 * 1024;

const habilitado = process.env.MODO_SESION_ENABLED !== 'false';

function esPesada(url: string): boolean {
    if (EN_VIVO.some((p) => url.startsWith(p))) return false;
    return PESADAS.some((p) => url.startsWith(p));
}

// ── Caché ───────────────────────────────────────────────────────────────
const cache = new Map<string, { status: number; body: any; expiraEn: number }>();

function guardarEnCache(clave: string, status: number, body: any) {
    try {
        if (JSON.stringify(body).length > MAX_BYTES_RESPUESTA) return;
    } catch {
        return;
    }
    if (cache.size >= MAX_ENTRADAS_CACHE) {
        // Map conserva orden de inserción: el primero es el más viejo.
        const primera = cache.keys().next().value;
        if (primera !== undefined) cache.delete(primera);
    }
    cache.set(clave, { status, body, expiraEn: Date.now() + TTL_MS });
}

// ── Semáforo (tope de concurrencia) ────────────────────────────────────
let enCurso = 0;
const fila: Array<() => void> = [];

function pedirTurno(): Promise<boolean> {
    if (enCurso < MAX_CONCURRENTES) {
        enCurso++;
        return Promise.resolve(true);
    }
    return new Promise((resolve) => {
        const turno = () => {
            clearTimeout(timer);
            enCurso++;
            resolve(true);
        };
        const timer = setTimeout(() => {
            const i = fila.indexOf(turno);
            if (i >= 0) fila.splice(i, 1);
            resolve(false);
        }, ESPERA_MAX_MS);
        fila.push(turno);
    });
}

function liberarTurno() {
    enCurso = Math.max(0, enCurso - 1);
    const siguiente = fila.shift();
    if (siguiente) siguiente();
}

let estabaActivo = false;

/** Estado para diagnóstico (lo expone /api/diagnostico/metricas si se quiere). */
export function estadoModoSesion() {
    return { habilitado, activo: estabaActivo, enCurso, enFila: fila.length, entradasCache: cache.size, maxConcurrentes: MAX_CONCURRENTES };
}

/**
 * @param hayEventoAbierto función barata (lee los mapas en memoria) que dice
 *        si en este momento hay asistencia o votación abierta.
 */
export function crearModoSesion(hayEventoAbierto: () => boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!habilitado || !esPesada(req.originalUrl)) return next();

        const activo = hayEventoAbierto();
        if (activo !== estabaActivo) {
            estabaActivo = activo;
            console.log(`[MODO-SESION] ${activo ? 'ACTIVADO (asistencia/votación abierta)' : 'desactivado'}`);
            // Al salir del modo sesión se descarta la caché: afuera todo es fresco.
            if (!activo) cache.clear();
        }
        if (!activo) return next();

        // 1. Caché (solo GET). La clave incluye al usuario por si alguna ruta
        //    con JWT responde distinto según quién pregunta.
        const usuario = (req as any).user?.id ?? (req as any).user?.integrante_legislatura_id ?? 'publico';
        const clave = `${usuario}|${req.originalUrl}`;
        if (req.method === 'GET') {
            const hit = cache.get(clave);
            if (hit && hit.expiraEn > Date.now()) {
                res.setHeader('X-Modo-Sesion', 'cache');
                return res.status(hit.status).json(hit.body);
            }
        }

        // 2. Tope de concurrencia.
        const ok = await pedirTurno();
        if (!ok) {
            res.setHeader('Retry-After', '15');
            return res.status(503).json({
                msg: 'Hay una votación/asistencia en curso; esta consulta se pospuso para no afectarla. Intente de nuevo en unos segundos.',
            });
        }

        let liberado = false;
        const liberar = () => {
            if (liberado) return;
            liberado = true;
            liberarTurno();
        };
        res.on('finish', liberar);
        res.on('close', liberar);

        if (req.method === 'GET') {
            const jsonOriginal = res.json.bind(res);
            res.json = (body: any) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    guardarEnCache(clave, res.statusCode, body);
                }
                return jsonOriginal(body);
            };
        }

        res.setHeader('X-Modo-Sesion', 'limitado');
        next();
    };
}
