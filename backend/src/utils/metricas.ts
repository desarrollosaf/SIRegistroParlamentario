import { monitorEventLoopDelay } from 'perf_hooks';
import type { Sequelize } from 'sequelize';

/**
 * Fase 0 del plan de estabilidad: medir ANTES de optimizar.
 *
 * Responde la pregunta "¿por qué se alentó el voto?" con datos:
 *  - Event loop: si sube, Node estuvo ocupado (PDF, JSON enorme, cálculo) y
 *    TODAS las peticiones esperaron, aunque la BD estuviera libre.
 *  - Espera de pool: si sube, las conexiones a la BD estaban todas ocupadas
 *    (consultas pesadas acaparándolas) y el voto hizo fila por una.
 *  - Duración de voto/asistencia: lo que realmente sintió el diputado.
 *
 * Todo vive en memoria y es barato (no consulta la BD). Se consulta en
 * GET /api/diagnostico/metricas y además se loguea solo cuando algo sale mal.
 */

const UMBRAL_EVENT_LOOP_MS = Number(process.env.METRICAS_UMBRAL_EVENT_LOOP_MS) || 100;
const UMBRAL_POOL_MS = Number(process.env.METRICAS_UMBRAL_POOL_MS) || 200;
const UMBRAL_REGISTRO_MS = Number(process.env.METRICAS_UMBRAL_REGISTRO_MS) || 500;
const MUESTRAS_MAX = 2000;

// ── Event loop ──────────────────────────────────────────────────────────
const histograma = monitorEventLoopDelay({ resolution: 20 });
histograma.enable();

let ultimoEventLoop = { p50: 0, p99: 0, max: 0, desde: new Date().toISOString() };

// Cada minuto se "cierra" una ventana: se guarda y se loguea si fue mala.
setInterval(() => {
    const ns = 1e6;
    ultimoEventLoop = {
        p50: Math.round(histograma.percentile(50) / ns),
        p99: Math.round(histograma.percentile(99) / ns),
        max: Math.round(histograma.max / ns),
        desde: ultimoEventLoop.desde,
    };
    if (ultimoEventLoop.p99 > UMBRAL_EVENT_LOOP_MS) {
        console.warn(`[EVENT-LOOP] p99=${ultimoEventLoop.p99}ms max=${ultimoEventLoop.max}ms en el último minuto — Node estuvo bloqueado`);
    }
    histograma.reset();
    ultimoEventLoop.desde = new Date().toISOString();
}, 60 * 1000).unref();

// ── Muestras de duración (ring buffer simple) ───────────────────────────
class Muestras {
    private valores: number[] = [];
    private total = 0;
    private lentas = 0;

    agregar(ms: number, umbral: number) {
        this.total++;
        if (ms > umbral) this.lentas++;
        this.valores.push(ms);
        if (this.valores.length > MUESTRAS_MAX) this.valores.shift();
    }

    resumen() {
        const ordenados = [...this.valores].sort((a, b) => a - b);
        const p = (q: number) => ordenados.length ? ordenados[Math.min(ordenados.length - 1, Math.floor(q * ordenados.length))] : 0;
        return {
            total: this.total,
            lentas: this.lentas,
            p50: p(0.5),
            p95: p(0.95),
            max: ordenados.length ? ordenados[ordenados.length - 1] : 0,
            muestras: ordenados.length,
        };
    }
}

const registros: Record<string, Muestras> = {};

/** Duración de un registro de voto/asistencia (lo que sintió el diputado). */
export function registrarDuracion(tipo: 'voto' | 'asistencia', ms: number, detalle?: string) {
    (registros[tipo] ??= new Muestras()).agregar(ms, UMBRAL_REGISTRO_MS);
    if (ms > UMBRAL_REGISTRO_MS) {
        console.warn(`[${tipo.toUpperCase()}-LENTO] ${ms}ms${detalle ? ' ' + detalle : ''}`);
    }
}

// ── Pools de Sequelize ─────────────────────────────────────────────────
const pools: Record<string, { sequelize: Sequelize; espera: Muestras }> = {};

/**
 * Mide cuánto espera cada petición por una conexión libre del pool.
 * Usa los hooks beforePoolAcquire/afterPoolAcquire de Sequelize (v6.37):
 * ambos reciben el MISMO objeto `options`, así que sirve de llave.
 */
export function monitorearPool(nombre: string, sequelize: Sequelize) {
    if (pools[nombre]) return;
    const espera = new Muestras();
    pools[nombre] = { sequelize, espera };
    const inicios = new WeakMap<object, number>();

    sequelize.addHook('beforePoolAcquire', (options: any) => {
        if (options && typeof options === 'object') inicios.set(options, Date.now());
    });
    sequelize.addHook('afterPoolAcquire', (_conn: any, options: any) => {
        if (!options || typeof options !== 'object') return;
        const inicio = inicios.get(options);
        if (inicio === undefined) return;
        inicios.delete(options);
        const ms = Date.now() - inicio;
        espera.agregar(ms, UMBRAL_POOL_MS);
        if (ms > UMBRAL_POOL_MS) {
            const estado = estadoPool(sequelize);
            console.warn(`[POOL-ESPERA] ${nombre}: ${ms}ms esperando conexión (usando=${estado.usando} esperando=${estado.esperando} max=${estado.max})`);
        }
    });
}

function estadoPool(sequelize: Sequelize) {
    const pool: any = (sequelize as any).connectionManager?.pool;
    // Sin replicación, `pool` es directamente el Pool de sequelize-pool.
    const p = pool?.write ?? pool;
    return {
        abiertas: p?.size ?? null,
        libres: p?.available ?? null,
        usando: p?.using ?? null,
        esperando: p?.waiting ?? null,
        max: (sequelize as any).options?.pool?.max ?? null,
    };
}

/** Foto completa para GET /api/diagnostico/metricas. */
export function obtenerMetricas() {
    const ns = 1e6;
    const pools_: Record<string, any> = {};
    for (const [nombre, { sequelize, espera }] of Object.entries(pools)) {
        pools_[nombre] = { ...estadoPool(sequelize), esperaMs: espera.resumen() };
    }
    const registros_: Record<string, any> = {};
    for (const [tipo, m] of Object.entries(registros)) registros_[tipo] = m.resumen();

    return {
        ahora: new Date().toISOString(),
        umbrales: { eventLoopMs: UMBRAL_EVENT_LOOP_MS, poolMs: UMBRAL_POOL_MS, registroMs: UMBRAL_REGISTRO_MS },
        eventLoop: {
            ultimoMinuto: ultimoEventLoop,
            ventanaActual: {
                p50: Math.round(histograma.percentile(50) / ns),
                p99: Math.round(histograma.percentile(99) / ns),
                max: Math.round(histograma.max / ns),
            },
        },
        pools: pools_,
        registros: registros_,
        memoriaMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    };
}
