import sequelize from '../database/registrocomisiones';

/**
 * Fase 1 del plan de estabilidad: que un reinicio del contenedor NO tumbe
 * una votación o asistencia abierta.
 *
 * Antes, asistenciasAbiertas / votacionesAbiertas / sesionesActivas vivían
 * solo en memoria: si Node se reiniciaba a media votación, el servidor
 * "olvidaba" que estaba abierta y los diputados ya no podían votar.
 *
 * MapaPersistente es un Map normal (todo el código que ya lo usa sigue
 * igual, incluidas las lecturas síncronas de capturadora/SPID/pleno), pero
 * cada set/delete/clear programa un respaldo del mapa COMPLETO en la tabla
 * `estado_eventos_abiertos` (una fila por mapa, JSON). Abrir/cerrar pasa
 * pocas veces por sesión, así que guardar el mapa entero es barato y evita
 * inconsistencias de guardar entrada por entrada.
 *
 * La escritura NUNCA bloquea ni rompe el flujo en vivo: si la BD falla, se
 * loguea y se reintenta; la memoria sigue siendo la fuente de verdad.
 */

const TABLA = 'estado_eventos_abiertos';
const REINTENTO_MS = 5000;
// Entradas más viejas que esto se descartan al recargar: evita revivir una
// votación que alguien dejó abierta y se olvidó días atrás.
const MAX_HORAS = Number(process.env.ESTADO_EVENTOS_MAX_HORAS) || 24;

let tablaLista: Promise<void> | null = null;

function asegurarTabla(): Promise<void> {
    if (!tablaLista) {
        tablaLista = sequelize.query(
            `CREATE TABLE IF NOT EXISTS ${TABLA} (
                tipo VARCHAR(40) NOT NULL PRIMARY KEY,
                datos LONGTEXT NOT NULL,
                actualizado_en DATETIME NOT NULL
            ) DEFAULT CHARSET=utf8mb4`
        ).then(() => undefined).catch((err) => {
            tablaLista = null; // se reintenta en el próximo guardado
            throw err;
        });
    }
    return tablaLista;
}

export class MapaPersistente<V> extends Map<string, V> {
    private pendiente = false;
    private guardando: Promise<void> = Promise.resolve();
    private reintento: NodeJS.Timeout | null = null;
    private cargando = false;

    constructor(private readonly tipo: string) {
        super();
    }

    set(clave: string, valor: V): this {
        super.set(clave, valor);
        this.programarGuardado();
        return this;
    }

    delete(clave: string): boolean {
        const borrado = super.delete(clave);
        if (borrado) this.programarGuardado();
        return borrado;
    }

    clear(): void {
        const habia = this.size > 0;
        super.clear();
        if (habia) this.programarGuardado();
    }

    /**
     * Junta todos los cambios del mismo tick en UNA escritura (p.ej. abrir
     * votación hace un set por cada comisión conjunta) y encadena los
     * guardados para que nunca se escriba una foto vieja encima de una nueva.
     */
    private programarGuardado() {
        // El constructor de Map no llama a set (no se le pasan entradas),
        // pero `cargando` cubre la recarga desde BD.
        if (this.cargando || this.pendiente) return;
        this.pendiente = true;
        setImmediate(() => {
            this.pendiente = false;
            const foto = JSON.stringify(Array.from(super.entries()));
            this.guardando = this.guardando
                .then(() => this.escribir(foto))
                .catch((err) => {
                    console.error(`[ESTADO] No se pudo respaldar '${this.tipo}' en BD (se reintenta en ${REINTENTO_MS / 1000}s):`, err?.message || err);
                    if (!this.reintento) {
                        this.reintento = setTimeout(() => {
                            this.reintento = null;
                            this.programarGuardado();
                        }, REINTENTO_MS);
                    }
                });
        });
    }

    private async escribir(foto: string) {
        await asegurarTabla();
        await sequelize.query(
            `INSERT INTO ${TABLA} (tipo, datos, actualizado_en) VALUES (:tipo, :datos, NOW())
             ON DUPLICATE KEY UPDATE datos = VALUES(datos), actualizado_en = VALUES(actualizado_en)`,
            { replacements: { tipo: this.tipo, datos: foto } }
        );
    }

    /**
     * Recarga lo guardado (al arrancar). `fechaDe` dice qué campo de cada
     * valor trae la fecha de apertura, para descartar entradas viejas.
     */
    async cargar(fechaDe?: (valor: V) => string | undefined): Promise<number> {
        await asegurarTabla();
        const [filas]: any = await sequelize.query(
            `SELECT datos FROM ${TABLA} WHERE tipo = :tipo LIMIT 1`,
            { replacements: { tipo: this.tipo } }
        );
        if (!filas?.length) return 0;

        let entradas: [string, V][] = [];
        try {
            entradas = JSON.parse(filas[0].datos);
        } catch {
            console.error(`[ESTADO] Respaldo de '${this.tipo}' corrupto, se ignora`);
            return 0;
        }

        const limite = Date.now() - MAX_HORAS * 3600 * 1000;
        let cargadas = 0;
        let descartadas = 0;
        this.cargando = true;
        try {
            for (const [clave, valor] of entradas) {
                const fecha = fechaDe?.(valor);
                if (fecha && new Date(fecha).getTime() < limite) {
                    descartadas++;
                    continue;
                }
                // Lo que ya esté en memoria (abierto mientras se cargaba) gana.
                if (!super.has(clave)) {
                    super.set(clave, valor);
                    cargadas++;
                }
            }
        } finally {
            this.cargando = false;
        }
        // Si se descartó algo viejo, se reescribe el respaldo ya limpio.
        if (descartadas > 0) this.programarGuardado();
        return cargadas;
    }
}
