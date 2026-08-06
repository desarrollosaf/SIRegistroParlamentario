"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
/**
 * Motor de reconciliación (SOLO LECTURA): para cada folio del Excel
 * histórico, busca el punto de orden del día REAL que le corresponde,
 * anclando por fecha exacta de presentación + coincidencia de texto, y
 * luego caminando el grafo real (iniciativas_estudios / expedientes) para
 * encontrar el punto real de Estudio/Dictamen y, si aplica, el cierre.
 *
 * No escribe nada en la BD. Genera:
 *   - backend/src/data/reportes-import-historico/reconciliacion.csv (resumen tabular)
 *   - backend/src/data/reportes-import-historico/reconciliacion.json (detalle completo)
 *
 * Uso: ts-node src/scripts/importar-historico/reconciliar.ts [--limite N]
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const agendas_1 = __importDefault(require("../../models/agendas"));
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const catalogos_1 = require("./catalogos");
const matching_texto_1 = require("./matching-texto");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const REPORTES_DIR = path_1.default.resolve(__dirname, '../../data/reportes-import-historico');
const CSV_SALIDA = path_1.default.join(REPORTES_DIR, 'reconciliacion.csv');
const JSON_SALIDA = path_1.default.join(REPORTES_DIR, 'reconciliacion.json');
// tipo_eventos: "Diputación permanente" — usada para presentar iniciativas
// fuera de periodo ordinario de sesiones (recesos).
const DIPUTACION_PERMANENTE_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';
function diasEntre(a, b) {
    if (!a || !b)
        return null;
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (Number.isNaN(da) || Number.isNaN(db))
        return null;
    return Math.round(Math.abs(da - db) / 86400000);
}
function construirHop(estudio, origenId, via, expedienteId, tipoEventoPorId) {
    return __awaiter(this, void 0, void 0, function* () {
        const destinoId = Number(estudio.punto_destino_id);
        const punto = yield puntos_ordens_1.default.findByPk(destinoId);
        const agenda = punto ? yield agendas_1.default.findByPk(punto.id_evento) : null;
        return {
            puntoId: destinoId,
            agendaId: agenda ? agenda.id : '',
            fechaReal: agenda ? new Date(agenda.fecha).toISOString().slice(0, 10) : null,
            tipoEventoNombre: agenda ? tipoEventoPorId.get(agenda.tipo_evento_id) || '?' : '?',
            status: String(estudio.status),
            via,
            expedienteId,
            esCierre: destinoId === Number(origenId),
            textoPunto: punto ? String(punto.punto || '').slice(0, 150) : '',
            profundidad: 0,
            origenId,
        };
    });
}
/**
 * Busca TODAS las ramas que salen de un punto (no solo la primera): una
 * iniciativa turnada a varias comisiones genera un Expediente independiente
 * por cada comisión (y a veces por cada ronda de estudio), todos apuntando
 * a los mismos puntos de sesión de origen — no es una cadena lineal.
 */
function buscarHopsDesde(origenId, tipoEventoPorId) {
    return __awaiter(this, void 0, void 0, function* () {
        const hops = [];
        // 1) camino directo: origenId ya es un punto real (o un expediente_id, en
        //    llamadas recursivas desde el camino por expediente).
        const directos = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: String(origenId) } });
        for (const d of directos) {
            hops.push(yield construirHop(d, origenId, d.type === '2' ? 'expediente' : 'directo', undefined, tipoEventoPorId));
        }
        // 2) camino(s) por expediente: origenId es un punto de SESIÓN que puede
        //    haber sido agrupado en varios expedientes distintos (uno por comisión
        //    turnada, o por ronda de estudio).
        const expPuntos = yield expedientes_estudio_puntos_1.default.findAll({ where: { punto_origen_sesion_id: origenId } });
        for (const expPunto of expPuntos) {
            const expedienteId = expPunto.expediente_id;
            const viasExpediente = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: String(expedienteId) } });
            for (const v of viasExpediente) {
                hops.push(yield construirHop(v, origenId, 'expediente', expedienteId, tipoEventoPorId));
            }
        }
        return hops;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const limiteIdx = process.argv.indexOf('--limite');
        const limite = limiteIdx >= 0 ? parseInt(process.argv[limiteIdx + 1], 10) : Infinity;
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const { sesionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const tipoEventosDb = yield (yield Promise.resolve().then(() => __importStar(require('../../models/tipo_eventos')))).default.findAll();
        const tipoEventoPorId = new Map(tipoEventosDb.map((t) => [t.id, t.nombre]));
        const folios = new Map();
        for (const fila of filas) {
            if (!folios.has(fila.folio))
                folios.set(fila.folio, []);
            folios.get(fila.folio).push(fila);
        }
        fs_1.default.mkdirSync(REPORTES_DIR, { recursive: true });
        const resultados = [];
        const csvFilas = [
            'folio,texto,fecha_presentacion,score_presentacion,agenda_presentacion_id,punto_presentacion_id,num_ramas_nivel1,via,expediente_id,punto_destino_id,tipo_evento_real,fecha_real_destino,fecha_evento_excel,status_destino,cierre_encontrado,fecha_cierre_real,fecha_aprobacion_excel,estado_excel,confianza',
        ];
        let procesados = 0;
        let conMatchPresentacion = 0;
        let sinAgendaPresentacion = 0;
        let sinMatchTexto = 0;
        let conCadenaReal = 0;
        let viaExpedienteCount = 0;
        let conCierre = 0;
        const cacheAgendasPorFecha = new Map();
        for (const [folio, filasFolio] of folios) {
            if (procesados >= limite)
                break;
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            procesados++;
            const primeraFila = usables[0];
            const estadoFinal = usables[usables.length - 1].estado;
            const fechaPresentacion = primeraFila.fecha_presentacion;
            let agendas = cacheAgendasPorFecha.get(fechaPresentacion);
            if (!agendas) {
                agendas = fechaPresentacion ? yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fechaPresentacion, sesionId) : [];
                if (agendas.length === 0 && fechaPresentacion) {
                    // Fuera de periodo ordinario, las iniciativas se presentan ante la
                    // Diputación Permanente en vez de una Sesión — mismo mecanismo, otro
                    // tipo_evento. Confirmado: 103/104 de los "sin agenda" tenían esto.
                    agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fechaPresentacion, DIPUTACION_PERMANENTE_ID);
                }
                cacheAgendasPorFecha.set(fechaPresentacion, agendas);
            }
            if (agendas.length === 0) {
                sinAgendaPresentacion++;
                resultados.push({ folio, texto: primeraFila.texto_iniciativa, estado: 'sin_agenda_presentacion' });
                csvFilas.push([folio, `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`, fechaPresentacion, '', '', '', '', '', '', '', '', '', '', '', '', '', usables[usables.length - 1].fecha_aprobacion, estadoFinal, 'sin_match'].join(','));
                continue;
            }
            const candidatos = [];
            for (const ag of agendas) {
                const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
                for (const p of puntos)
                    candidatos.push({ id: p.id, texto: p.punto || '' });
            }
            const match = (0, matching_texto_1.elegirMejorCandidato)(primeraFila.texto_iniciativa, candidatos);
            if (!match) {
                sinMatchTexto++;
                resultados.push({ folio, texto: primeraFila.texto_iniciativa, estado: 'sin_match_texto', candidatos: candidatos.length });
                csvFilas.push([folio, `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`, fechaPresentacion, '', '', '', '', '', '', '', '', '', '', '', '', '', usables[usables.length - 1].fecha_aprobacion, estadoFinal, 'sin_match'].join(','));
                continue;
            }
            conMatchPresentacion++;
            const puntoPresentacion = candidatos.find((c) => c.id === match.puntoId);
            const agendaPresentacion = agendas.find((ag) => true); // misma fecha, se reporta la primera si hay varias
            // caminar el grafo real desde el punto de presentación: BFS ramificado
            // (una iniciativa turnada a varias comisiones genera una rama real por
            // cada una, más una por cada ronda de estudio — no es lineal).
            const ramas = [];
            const porExplorar = [{ origenId: match.puntoId, profundidad: 0 }];
            const visitados = new Set();
            const MAX_PROFUNDIDAD = 4;
            while (porExplorar.length > 0) {
                const actual = porExplorar.shift();
                const key = String(actual.origenId);
                if (actual.profundidad >= MAX_PROFUNDIDAD || visitados.has(key))
                    continue;
                visitados.add(key);
                const hops = yield buscarHopsDesde(actual.origenId, tipoEventoPorId);
                for (const hop of hops) {
                    hop.profundidad = actual.profundidad + 1;
                    ramas.push(hop);
                    if (!hop.esCierre)
                        porExplorar.push({ origenId: hop.puntoId, profundidad: hop.profundidad });
                }
            }
            const ramasNivel1 = ramas.filter((h) => h.profundidad === 1);
            if (ramas.length > 0)
                conCadenaReal++;
            if (ramas.some((h) => h.via === 'expediente'))
                viaExpedienteCount++;
            const hopsCierre = ramas.filter((h) => h.esCierre);
            if (hopsCierre.length > 0)
                conCierre++;
            const fechaEventoExcel = ((_a = usables.find((f) => f.tipo_evento === 'Estudio' || f.tipo_evento === 'Dictamen')) === null || _a === void 0 ? void 0 : _a.fecha_evento) || '';
            // de todas las ramas de primer nivel, la más cercana en fecha a lo que dice el Excel
            let primerHop;
            let diffEventoDias = null;
            for (const h of ramasNivel1) {
                const d = diasEntre(h.fechaReal, fechaEventoExcel);
                if (d !== null && (diffEventoDias === null || d < diffEventoDias)) {
                    diffEventoDias = d;
                    primerHop = h;
                }
            }
            if (!primerHop)
                primerHop = ramasNivel1[0];
            let hopCierre;
            let diffCierreDias = null;
            for (const h of hopsCierre) {
                const d = diasEntre(h.fechaReal, usables[usables.length - 1].fecha_aprobacion);
                if (d !== null && (diffCierreDias === null || d < diffCierreDias)) {
                    diffCierreDias = d;
                    hopCierre = h;
                }
            }
            let confianza;
            if (!primerHop)
                confianza = match.score >= 0.5 ? 'media' : 'baja';
            else if (diffEventoDias !== null && diffEventoDias <= 3)
                confianza = 'alta';
            else if (diffEventoDias !== null && diffEventoDias <= 10)
                confianza = 'media';
            else
                confianza = 'baja';
            resultados.push({
                folio,
                texto: primeraFila.texto_iniciativa,
                fechaPresentacionExcel: fechaPresentacion,
                matchPresentacion: {
                    agendaId: agendaPresentacion === null || agendaPresentacion === void 0 ? void 0 : agendaPresentacion.id,
                    puntoId: match.puntoId,
                    score: Number(match.score.toFixed(3)),
                    margen: Number(match.margen.toFixed(3)),
                    textoPunto: puntoPresentacion.texto.slice(0, 150),
                    candidatosEnFecha: candidatos.length,
                },
                ramasReales: ramas,
                numRamasNivel1: ramasNivel1.length,
                estadoExcel: estadoFinal,
                fechaAprobacionExcel: usables[usables.length - 1].fecha_aprobacion,
                diffEventoDias,
                diffCierreDias,
                confianza,
            });
            csvFilas.push([
                folio,
                `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`,
                fechaPresentacion,
                match.score.toFixed(3),
                (agendaPresentacion === null || agendaPresentacion === void 0 ? void 0 : agendaPresentacion.id) || '',
                match.puntoId,
                ramasNivel1.length,
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.via) || '',
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.expedienteId) || '',
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.puntoId) || '',
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.tipoEventoNombre) || '',
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.fechaReal) || '',
                fechaEventoExcel,
                (primerHop === null || primerHop === void 0 ? void 0 : primerHop.status) || '',
                hopsCierre.length > 0 ? 'si' : 'no',
                (hopCierre === null || hopCierre === void 0 ? void 0 : hopCierre.fechaReal) || '',
                usables[usables.length - 1].fecha_aprobacion,
                estadoFinal,
                confianza,
            ].join(','));
            if (procesados % 200 === 0)
                console.log(`  ... ${procesados} folios procesados`);
        }
        fs_1.default.writeFileSync(CSV_SALIDA, csvFilas.join('\n') + '\n', 'utf8');
        fs_1.default.writeFileSync(JSON_SALIDA, JSON.stringify(resultados, null, 2), 'utf8');
        console.log('\n══════════ RESUMEN RECONCILIACIÓN ══════════');
        console.log(`Folios procesados: ${procesados}`);
        console.log(`  Con match de presentación (fecha+texto): ${conMatchPresentacion}`);
        console.log(`    Sin agenda real en esa fecha: ${sinAgendaPresentacion}`);
        console.log(`    Sin match de texto (agenda existe, ningún punto cuadra): ${sinMatchTexto}`);
        console.log(`  Con cadena real encontrada (Estudio/Dictamen): ${conCadenaReal}`);
        console.log(`    ... de las cuales vía expediente (bundling): ${viaExpedienteCount}`);
        console.log(`  Con cierre real encontrado: ${conCierre}`);
        console.log(`\nReporte: ${CSV_SALIDA}`);
        console.log(`Detalle: ${JSON_SALIDA}`);
        console.log('══════════════════════════════════════════\n');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
