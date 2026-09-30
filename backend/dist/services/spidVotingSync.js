"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSpidVotingSync = startSpidVotingSync;
/**
 * Espejo de contingencia: spid (legado, Laravel, no se toca) sigue siendo
 * donde los diputados registran asistencia/voto. Este poller solo LEE su
 * base MySQL y registra cada cambio con la misma lógica del webhook
 * POST /api/capturadora/voto (registrarDesdeCapturadora en
 * routes/capturadora.ts), llamándola directo en vez de por HTTP — así se
 * prueba el flujo real de SIRegistroParlamentario en producción sin depender
 * de él ni modificar spid.
 *
 * Opt-in: si SPID_SYNC_ENABLED !== 'true' o faltan credenciales de spid, no
 * se abre ni siquiera la conexión. Cualquier error (spid caído, red, sin
 * match, sin votación abierta en SIRegistroParlamentario) se loguea y el
 * poller sigue en el siguiente tick — nunca debe afectar al resto del backend.
 */
const sequelize_1 = require("sequelize");
const spidConnection_1 = __importDefault(require("../database/spidConnection"));
const capturadora_1 = require("../routes/capturadora");
const LOG_PREFIX = '[spid-sync]';
let app = null;
const MENSAJE_A_SENTIDO = {
    FAVOR: 'FAVOR',
    CONTRA: 'CONTRA',
    ABSTENCION: 'ABSTENCION',
};
// updated_at de Laravel es TIMESTAMP con precisión de SEGUNDOS: si varios
// diputados registran en el mismo segundo y el tick lee a la mitad, un
// `updated_at > checkpoint` estricto se salta a los que llegaron después en
// ese mismo segundo. Por eso se relee una ventana hacia atrás y se deduplica.
const VENTANA_RELECTURA_MS = 15 * 1000;
// Cuántos registros se hacen a la vez contra la BD de SIRegistroParlamentario.
const CONCURRENCIA = 10;
// Un voto de spid que llega antes de que SIRegistroParlamentario abra la
// votación se queda pendiente MIENTRAS su votación siga abierta en spid
// (temas_votos.status = 1); en cuanto spid la cierra se descarta, así nunca
// cae en un punto posterior. Este tope es solo por si spid nunca la cierra.
const VOTO_PENDIENTE_MAX_MS = 30 * 60 * 1000;
// Una asistencia de spid que llega cuando SIRegistroParlamentario todavía no
// abre la asistencia de la Sesión se reintenta hasta que entre. Pasado este
// tiempo se descarta (ya no es la misma sesión).
const REINTENTO_ASISTENCIA_MAX_MS = 4 * 60 * 60 * 1000;
// Las asistencias pendientes se reintentan cada tanto, no en cada tick, para
// que no retrasen los votos.
const REINTENTO_ASISTENCIA_CADA_MS = 5 * 1000;
// Si la lectura a spid tarda más que esto, se avisa en el log.
const LECTURA_LENTA_MS = 500;
let checkpointVotos = new Date();
let checkpointAsistencias = new Date();
// Lo que ya existía al arrancar no se reenvía aunque caiga en la ventana.
let pisoVotos = new Date();
let pisoAsistencias = new Date();
let cicloEnCurso = false;
// clave (id|updated_at|mensaje) -> ms de updated_at, para no reenviar lo
// que la ventana de relectura vuelve a traer.
const votosVistos = new Map();
const asistenciasVistas = new Map();
// `${id_votacion}|${nombre_db}` -> último voto de ese diputado en esa votación
const votosPendientes = new Map();
// nombre_db -> estado de reintento
const asistenciasPendientes = new Map();
// nombres sin nombre_captura en SIRegistroParlamentario: se avisa una sola vez
const nombresSinMatchAvisados = new Set();
// id_votacion de spid -> votos registrados en SIRegistroParlamentario, para
// comparar contra el conteo que muestra spid.
const registradosPorVotacion = new Map();
function obtenerCheckpointInicial(tabla) {
    return __awaiter(this, void 0, void 0, function* () {
        const [fila] = yield spidConnection_1.default.query(`SELECT MAX(updated_at) AS maxUpdated FROM ${tabla}`, { type: sequelize_1.QueryTypes.SELECT });
        // Sin historial previo: arranca desde "ahora", nunca desde el epoch — esto
        // es un espejo hacia adelante, no una migración de datos históricos.
        return (fila === null || fila === void 0 ? void 0 : fila.maxUpdated) ? new Date(fila.maxUpdated) : new Date();
    });
}
function registrar(nombre, sentido, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!app) {
            return { status: 500, body: { msg: 'spid-sync sin app de Express' } };
        }
        return (0, capturadora_1.registrarDesdeCapturadora)(app, { nombre, sentido, tipo });
    });
}
/** Corre fn sobre items con a lo más `limite` a la vez. */
function enParalelo(items, limite, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        let siguiente = 0;
        const trabajadores = Array.from({ length: Math.min(limite, items.length) }, () => __awaiter(this, void 0, void 0, function* () {
            while (siguiente < items.length) {
                const item = items[siguiente++];
                try {
                    yield fn(item);
                }
                catch (err) {
                    console.error(`${LOG_PREFIX} error inesperado registrando:`, (err === null || err === void 0 ? void 0 : err.message) || err);
                }
            }
        }));
        yield Promise.all(trabajadores);
    });
}
function avisarSinMatch(nombre) {
    if (nombresSinMatchAvisados.has(nombre))
        return;
    nombresSinMatchAvisados.add(nombre);
    console.warn(`${LOG_PREFIX} "${nombre}" no coincide con ningún diputados.nombre_captura en SIRegistroParlamentario — corrige nombre_captura de ese diputado`);
}
/** Lee filas nuevas (con ventana de relectura) y devuelve solo las no vistas. */
function leerCambios(sql, checkpoint, piso, vistos) {
    return __awaiter(this, void 0, void 0, function* () {
        const desde = new Date(checkpoint.getTime() - VENTANA_RELECTURA_MS);
        const inicio = Date.now();
        const filas = yield spidConnection_1.default.query(sql, {
            type: sequelize_1.QueryTypes.SELECT,
            replacements: { desde },
        });
        const msLectura = Date.now() - inicio;
        let nuevoCheckpoint = checkpoint;
        const nuevas = [];
        for (const fila of filas) {
            const ts = new Date(fila.updated_at);
            if (ts > nuevoCheckpoint)
                nuevoCheckpoint = ts;
            if (ts <= piso)
                continue;
            const clave = `${fila.id}|${ts.getTime()}|${fila.mensaje}`;
            if (vistos.has(clave))
                continue;
            vistos.set(clave, ts.getTime());
            nuevas.push(fila);
        }
        // Lo que ya quedó fuera de la ventana no puede volver a leerse.
        const limite = nuevoCheckpoint.getTime() - VENTANA_RELECTURA_MS * 2;
        for (const [clave, ms] of vistos) {
            if (ms < limite)
                vistos.delete(clave);
        }
        return { nuevas, nuevoCheckpoint, msLectura };
    });
}
function votacionesActivasEnSpid() {
    return __awaiter(this, void 0, void 0, function* () {
        const filas = yield spidConnection_1.default.query(`SELECT id FROM temas_votos WHERE status = 1`, { type: sequelize_1.QueryTypes.SELECT });
        return new Set(filas.map((f) => Number(f.id)));
    });
}
function procesarVotos(est) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { nuevas, nuevoCheckpoint, msLectura } = yield leerCambios(`SELECT m.id, m.mensaje, m.updated_at, m.id_votacion, d.nombre_db
     FROM mensajes_votos m
     JOIN datos_users d ON d.id = m.id_diputado
     WHERE m.status = 1
       AND m.mensaje IN ('FAVOR', 'CONTRA', 'ABSTENCION')
       AND m.updated_at >= :desde
     ORDER BY m.updated_at ASC`, checkpointVotos, pisoVotos, votosVistos);
        checkpointVotos = nuevoCheckpoint;
        est.msLecturaSpid += msLectura;
        est.votosLeidos = nuevas.length;
        const ahora = Date.now();
        for (const fila of nuevas) {
            if (!fila.nombre_db) {
                console.warn(`${LOG_PREFIX} voto id=${fila.id} sin nombre_db en spid, se omite`);
                continue;
            }
            const idVotacion = Number(fila.id_votacion);
            const clave = `${idVotacion}|${fila.nombre_db}`;
            const previo = votosPendientes.get(clave);
            // Si el diputado cambia su voto antes de que entre, vale el último.
            votosPendientes.set(clave, {
                nombre: fila.nombre_db,
                sentido: MENSAJE_A_SENTIDO[fila.mensaje],
                idVotacion,
                desde: (_a = previo === null || previo === void 0 ? void 0 : previo.desde) !== null && _a !== void 0 ? _a : ahora,
                avisadoEsperando: (_b = previo === null || previo === void 0 ? void 0 : previo.avisadoEsperando) !== null && _b !== void 0 ? _b : false,
            });
        }
        if (votosPendientes.size === 0)
            return;
        // Los pendientes de una votación que spid ya cerró se descartan: si se
        // registraran más tarde caerían en otro punto de SIRegistroParlamentario.
        const activas = yield votacionesActivasEnSpid();
        for (const [clave, p] of Array.from(votosPendientes.entries())) {
            if (!activas.has(p.idVotacion)) {
                votosPendientes.delete(clave);
                est.votosDescartados++;
                console.warn(`${LOG_PREFIX} voto "${p.nombre}" -> ${p.sentido} descartado: la votación ${p.idVotacion} de spid se cerró sin que hubiera votación abierta en SIRegistroParlamentario`);
            }
            else if (ahora - p.desde > VOTO_PENDIENTE_MAX_MS) {
                votosPendientes.delete(clave);
                est.votosDescartados++;
                console.warn(`${LOG_PREFIX} voto "${p.nombre}" -> ${p.sentido} descartado tras ${VOTO_PENDIENTE_MAX_MS / 60000} min pendiente`);
            }
        }
        yield enParalelo(Array.from(votosPendientes.entries()), CONCURRENCIA, (_a) => __awaiter(this, [_a], void 0, function* ([clave, p]) {
            const { status, body } = yield registrar(p.nombre, p.sentido, 'VOTO');
            // Mientras esperaba pudo llegar un voto más nuevo del mismo diputado:
            // solo se borra si sigue siendo el mismo pendiente.
            const quitar = () => {
                if (votosPendientes.get(clave) === p)
                    votosPendientes.delete(clave);
            };
            if (status === 200) {
                quitar();
                est.votosRegistrados++;
                est.votacionesTocadas.add(p.idVotacion);
                registradosPorVotacion.set(p.idVotacion, (registradosPorVotacion.get(p.idVotacion) || 0) + 1);
                return;
            }
            switch (body.codigo) {
                case 'SIN_EVENTO_ABIERTO':
                    // Se queda pendiente hasta que se abra la votación o spid la cierre.
                    if (!p.avisadoEsperando) {
                        p.avisadoEsperando = true;
                        console.log(`${LOG_PREFIX} voto "${p.nombre}" -> ${p.sentido} en espera: aún no hay votación abierta en SIRegistroParlamentario`);
                    }
                    return;
                case 'SIN_DIPUTADO':
                    quitar();
                    est.votosDescartados++;
                    avisarSinMatch(p.nombre);
                    return;
                case 'SIN_REGISTRO':
                    quitar();
                    est.votosDescartados++;
                    console.warn(`${LOG_PREFIX} voto "${p.nombre}": no existe su registro de voto en el punto abierto`);
                    return;
            }
            if (status >= 500) {
                console.error(`${LOG_PREFIX} error registrando voto de "${p.nombre}" (se reintenta): ${body.msg}`);
                return;
            }
            quitar();
            est.votosDescartados++;
            console.warn(`${LOG_PREFIX} voto "${p.nombre}" rechazado (${status}): ${body.msg}`);
        }));
        // Evita que el mapa crezca sin límite a lo largo de muchas sesiones.
        if (registradosPorVotacion.size > 50) {
            const masViejas = Array.from(registradosPorVotacion.keys()).sort((a, b) => a - b).slice(0, registradosPorVotacion.size - 50);
            masViejas.forEach((id) => registradosPorVotacion.delete(id));
        }
    });
}
function procesarAsistencias(est) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { nuevas, nuevoCheckpoint, msLectura } = yield leerCambios(`SELECT a.id, a.mensaje, a.updated_at, d.nombre_db
     FROM asistencia_votos a
     JOIN datos_users d ON d.id = a.id_diputado
     WHERE a.status = 1
       AND a.mensaje = 'ASISTENCIA'
       AND a.updated_at >= :desde
     ORDER BY a.updated_at ASC`, checkpointAsistencias, pisoAsistencias, asistenciasVistas);
        checkpointAsistencias = nuevoCheckpoint;
        est.msLecturaSpid += msLectura;
        est.asistLeidas = nuevas.length;
        const ahora = Date.now();
        for (const fila of nuevas) {
            if (!fila.nombre_db) {
                console.warn(`${LOG_PREFIX} asistencia id=${fila.id} sin nombre_db en spid, se omite`);
                continue;
            }
            const previo = asistenciasPendientes.get(fila.nombre_db);
            // Lo recién leído se intenta ya, aunque hubiera un reintento programado.
            asistenciasPendientes.set(fila.nombre_db, { desde: (_a = previo === null || previo === void 0 ? void 0 : previo.desde) !== null && _a !== void 0 ? _a : ahora, proximoIntento: 0 });
        }
        for (const [nombre, p] of Array.from(asistenciasPendientes.entries())) {
            if (ahora - p.desde > REINTENTO_ASISTENCIA_MAX_MS) {
                asistenciasPendientes.delete(nombre);
                est.asistDescartadas++;
                console.warn(`${LOG_PREFIX} asistencia "${nombre}" descartada tras ${REINTENTO_ASISTENCIA_MAX_MS / 3600000}h sin sesión abierta`);
            }
        }
        const aIntentar = Array.from(asistenciasPendientes.entries()).filter(([, p]) => p.proximoIntento <= ahora);
        // Cada nombre es independiente: uno sin match o con error no detiene al resto.
        yield enParalelo(aIntentar, CONCURRENCIA, (_a) => __awaiter(this, [_a], void 0, function* ([nombre, p]) {
            // tipo=ASISTENCIA: aunque haya una votación abierta, nunca se registra
            // como voto de abstención.
            const { status, body } = yield registrar(nombre, 'ABSTENCION', 'ASISTENCIA');
            if (status === 200) {
                asistenciasPendientes.delete(nombre);
                est.asistRegistradas++;
                return;
            }
            switch (body.codigo) {
                case 'SIN_DIPUTADO':
                    asistenciasPendientes.delete(nombre);
                    est.asistDescartadas++;
                    avisarSinMatch(nombre);
                    return;
                case 'SIN_REGISTRO':
                    asistenciasPendientes.delete(nombre);
                    est.asistDescartadas++;
                    console.warn(`${LOG_PREFIX} asistencia "${nombre}": no existe su registro en la asistencia abierta`);
                    return;
            }
            if (status >= 500) {
                console.error(`${LOG_PREFIX} error registrando asistencia de "${nombre}" (se reintenta): ${body.msg}`);
            }
            // SIN_EVENTO_ABIERTO o error: se reintenta más tarde sin frenar los votos.
            p.proximoIntento = Date.now() + REINTENTO_ASISTENCIA_CADA_MS;
        }));
    });
}
function loguearCiclo(est, msTotal) {
    const huboActividad = est.votosLeidos + est.votosRegistrados + est.votosDescartados +
        est.asistLeidas + est.asistRegistradas + est.asistDescartadas > 0;
    if (huboActividad) {
        const porVotacion = Array.from(est.votacionesTocadas)
            .map((id) => `#${id}=${registradosPorVotacion.get(id) || 0}`)
            .join(' ');
        console.log(`${LOG_PREFIX} ciclo ${msTotal}ms (spid ${est.msLecturaSpid}ms)` +
            ` | votos: leídos ${est.votosLeidos}, registrados ${est.votosRegistrados}, en espera ${votosPendientes.size}, descartados ${est.votosDescartados}` +
            ` | asistencias: leídas ${est.asistLeidas}, registradas ${est.asistRegistradas}, en espera ${asistenciasPendientes.size}, descartadas ${est.asistDescartadas}` +
            (porVotacion ? ` | total registrados por votación spid: ${porVotacion}` : ''));
    }
    if (est.msLecturaSpid > LECTURA_LENTA_MS) {
        console.warn(`${LOG_PREFIX} lectura a spid lenta: ${est.msLecturaSpid}ms`);
    }
}
function tick() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cicloEnCurso)
            return;
        cicloEnCurso = true;
        const inicio = Date.now();
        const est = {
            msLecturaSpid: 0,
            votosLeidos: 0,
            votosRegistrados: 0,
            votosDescartados: 0,
            asistLeidas: 0,
            asistRegistradas: 0,
            asistDescartadas: 0,
            votacionesTocadas: new Set(),
        };
        try {
            yield procesarVotos(est);
            yield procesarAsistencias(est);
        }
        catch (err) {
            console.error(`${LOG_PREFIX} error en el ciclo de sincronización:`, (err === null || err === void 0 ? void 0 : err.message) || err);
        }
        finally {
            loguearCiclo(est, Date.now() - inicio);
            cicloEnCurso = false;
        }
    });
}
function startSpidVotingSync(appExpress) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.SPID_SYNC_ENABLED !== 'true') {
            return;
        }
        if (!process.env.DB_HOST_SPID || !process.env.DB_USER_SPID) {
            console.error(`${LOG_PREFIX} SPID_SYNC_ENABLED=true pero faltan DB_HOST_SPID/DB_USER_SPID — no se inicia el sync.`);
            return;
        }
        app = appExpress;
        try {
            checkpointVotos = yield obtenerCheckpointInicial('mensajes_votos');
            checkpointAsistencias = yield obtenerCheckpointInicial('asistencia_votos');
            pisoVotos = checkpointVotos;
            pisoAsistencias = checkpointAsistencias;
        }
        catch (err) {
            console.error(`${LOG_PREFIX} no se pudo conectar a la BD de spid, sync deshabilitado para esta corrida:`, (err === null || err === void 0 ? void 0 : err.message) || err);
            return;
        }
        const intervalMs = Number(process.env.SPID_SYNC_INTERVAL_MS) || 1000;
        console.log(`${LOG_PREFIX} activo, revisando spid cada ${intervalMs}ms`);
        setInterval(tick, intervalMs);
    });
}
