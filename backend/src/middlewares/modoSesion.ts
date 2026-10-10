import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * "Modo sesión" (Fase 2) — y protección permanente del contenedor de consultas (Fase 3).
 *
 * Problema original: votos/asistencias compartían el MISMO proceso Node y el
 * MISMO pool con reportes y estadísticas históricas que consultan otros
 * sistemas (página del Congreso, inteligencia...). Si varias consultas
 * pesadas llegaban mientras 75 diputados votaban, acaparaban CPU/conexiones.
 *
 * Mientras esté ACTIVO (`estaActivo()`):
 *  1. Las consultas pesadas GET responden desde caché (por URL + usuario).
 *     Son datos históricos: unos minutos de antigüedad no importan.
 *  2. Si llegan varias peticiones IDÉNTICAS mientras una se está armando,
 *     las demás esperan y reciben esa misma respuesta (no se arma N veces).
 *  3. Tope de cuántas consultas pesadas corren a la vez; el resto espera
 *     turno y, si tarda demasiado, recibe 503 con Retry-After.
 *
 * Núcleo: activo solo con asistencia/votación abierta.
 * Consultas: activo SIEMPRE — ahí ya no protege a los votos (otro proceso),
 * protege al propio contenedor: sin tope, armar todos los reportes a la vez
 * agotó la memoria de Node y lo tumbó (visto en producción, 3 reinicios).
 *
 * Las rutas EN VIVO nunca pasan por aquí: no están en la lista de pesadas.
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
// Tope de memoria de la caché (no de número de entradas): con reportes de
// varios MB, un tope por cantidad podía llenar el heap igual.
const MAX_BYTES_CACHE = (Number(process.env.MODO_SESION_CACHE_MAX_MB) || 100) * 1024 * 1024;
// Respuestas más grandes que esto no se cachean.
const MAX_BYTES_RESPUESTA = 10 * 1024 * 1024;

const habilitado = process.env.MODO_SESION_ENABLED !== 'false';

function esPesada(url: string): boolean {
    if (EN_VIVO.some((p) => url.startsWith(p))) return false;
    return PESADAS.some((p) => url.startsWith(p));
}

// ── Caché: guarda el JSON ya serializado (se serializa UNA sola vez) ────
const cache = new Map<string, { status: number; json: string; bytes: number; expiraEn: number }>();
let bytesEnCache = 0;

function borrarDeCache(clave: string) {
    const e = cache.get(clave);
    if (!e) return;
    bytesEnCache -= e.bytes;
    cache.delete(clave);
}

function limpiarCache() {
    cache.clear();
    bytesEnCache = 0;
}

function guardarEnCache(clave: string, status: number, json: string) {
    const bytes = json.length * 2; // aprox. en memoria (strings UTF-16)
    if (bytes > MAX_BYTES_RESPUESTA) return;
    borrarDeCache(clave);
    // Map conserva orden de inserción: se desalojan primero las más viejas.
    while (bytesEnCache + bytes > MAX_BYTES_CACHE && cache.size > 0) {
        const primera = cache.keys().next().value;
        if (primera === undefined) break;
        borrarDeCache(primera);
    }
    cache.set(clave, { status, json, bytes, expiraEn: Date.now() + TTL_MS });
    bytesEnCache += bytes;
}

function leerDeCache(clave: string) {
    const hit = cache.get(clave);
    if (!hit) return null;
    if (hit.expiraEn <= Date.now()) {
        borrarDeCache(clave);
        return null;
    }
    return hit;
}

function responderDesdeCache(res: Response, hit: { status: number; json: string }, origen: string) {
    res.setHeader('X-Modo-Sesion', origen);
    res.status(hit.status).type('application/json').send(hit.json);
}

// ── Peticiones idénticas en vuelo (single-flight) ───────────────────────
const enVuelo = new Map<string, Promise<void>>();

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

/** Estado para diagnóstico (lo expone /api/diagnostico/metricas). */
export function estadoModoSesion() {
    return {
        habilitado,
        activo: estabaActivo,
        enCurso,
        enFila: fila.length,
        enVuelo: enVuelo.size,
        entradasCache: cache.size,
        cacheMB: Math.round(bytesEnCache / 1024 / 1024),
        maxConcurrentes: MAX_CONCURRENTES,
    };
}

/**
 * @param estaActivo función barata que dice si el modo está activo ahora
 *        (núcleo: hay asistencia/votación abierta; consultas: siempre).
 */
export function crearModoSesion(estaActivo: () => boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!habilitado || !esPesada(req.originalUrl)) return next();

        const activo = estaActivo();
        if (activo !== estabaActivo) {
            estabaActivo = activo;
            console.log(`[MODO-SESION] ${activo ? 'ACTIVADO' : 'desactivado'}`);
            // Al salir del modo se descarta la caché: afuera todo es fresco.
            if (!activo) limpiarCache();
        }
        if (!activo) return next();

        const esGet = req.method === 'GET';
        // La clave incluye al usuario por si alguna ruta con JWT responde
        // distinto según quién pregunta.
        const usuario = (req as any).user?.id ?? (req as any).user?.integrante_legislatura_id ?? 'publico';
        const clave = `${usuario}|${req.originalUrl}`;

        // 1. Caché.
        if (esGet) {
            const hit = leerDeCache(clave);
            if (hit) return responderDesdeCache(res, hit, 'cache');

            // 2. ¿La misma petición ya se está armando? Esperar y compartir.
            const previa = enVuelo.get(clave);
            if (previa) {
                await previa;
                const compartida = leerDeCache(clave);
                if (compartida) return responderDesdeCache(res, compartida, 'compartida');
                // La primera falló o no era cacheable: esta sigue por su cuenta.
            }
        }

        // Esta petición es la que arma la respuesta: las idénticas que lleguen
        // mientras tanto la esperan (en vez de ocupar memoria/turno cada una).
        let avisarListo: () => void = () => {};
        if (esGet && !enVuelo.has(clave)) {
            const promesa = new Promise<void>((resolve) => { avisarListo = resolve; });
            enVuelo.set(clave, promesa);
            const soltar = () => {
                if (enVuelo.get(clave) === promesa) enVuelo.delete(clave);
                avisarListo();
            };
            res.on('finish', soltar);
            res.on('close', soltar);
        }

        // 3. Tope de concurrencia.
        const ok = await pedirTurno();
        if (!ok) {
            res.setHeader('Retry-After', '15');
            return res.status(503).json({
                msg: 'El servidor está ocupado armando otros reportes; esta consulta se pospuso. Intente de nuevo en unos segundos.',
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

        if (esGet) {
            // Se serializa una sola vez: el mismo string se cachea y se envía.
            res.json = (body: any) => {
                const json = JSON.stringify(body);
                if (res.statusCode >= 200 && res.statusCode < 300 && json !== undefined) {
                    guardarEnCache(clave, res.statusCode, json);
                }
                if (!res.get('Content-Type')) res.type('application/json');
                return res.send(json);
            };
        }

        res.setHeader('X-Modo-Sesion', 'limitado');
        next();
    };
}
