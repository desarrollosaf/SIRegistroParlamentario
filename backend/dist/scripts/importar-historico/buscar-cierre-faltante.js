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
/**
 * Para los folios ya sembrados que dicen "Aprobada" en el Excel pero cuyo
 * cierre real no es alcanzable en la cadena actual (iniciativas_estudios que
 * YA reconstruí con reconstruir-cadena-v2.ts), busca el evento real de
 * Sesión en la Fecha de aprobación del Excel y — si encuentra un punto que
 * calza con confianza — AGREGA un nuevo eslabón de cierre (status "3") desde
 * la punta actual de la cadena de ese folio.
 *
 * SOLO AGREGA. Nunca borra ni toca los eslabones que ya existen (ni los del
 * backup, no se usa el backup aquí — fuente de verdad: el Excel).
 *
 * Uso: ts-node src/scripts/importar-historico/buscar-cierre-faltante.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const sequelize_1 = require("sequelize");
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const catalogos_1 = require("./catalogos");
const matching_texto_1 = require("./matching-texto");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const REPORTE_PATH = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/cierres-agregados.json');
/** BFS sobre la cadena actual: true si ya hay un status=3 alcanzable, si no, devuelve la frontera (puntas sin más salida) para colgar el cierre nuevo ahí. */
function analizarCadena(puntoInicial) {
    return __awaiter(this, void 0, void 0, function* () {
        const visitados = new Set();
        let nivelActual = [puntoInicial];
        const hojas = new Set([puntoInicial]);
        for (let profundidad = 0; profundidad < 6 && nivelActual.length > 0; profundidad++) {
            const siguienteNivel = [];
            for (const origen of nivelActual) {
                if (visitados.has(origen))
                    continue;
                visitados.add(origen);
                let tuvoHijos = false;
                const directos = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: String(origen) } });
                for (const d of directos) {
                    if (String(d.status) === '3')
                        return { yaTieneCierre: true, frontera: [] };
                    siguienteNivel.push(Number(d.punto_destino_id));
                    tuvoHijos = true;
                }
                const expPuntos = yield expedientes_estudio_puntos_1.default.findAll({ where: { punto_origen_sesion_id: origen } });
                for (const ep of expPuntos) {
                    const viaExp = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: String(ep.expediente_id) } });
                    for (const v of viaExp) {
                        if (String(v.status) === '3')
                            return { yaTieneCierre: true, frontera: [] };
                        siguienteNivel.push(Number(v.punto_destino_id));
                        tuvoHijos = true;
                    }
                }
                if (tuvoHijos)
                    hojas.delete(origen);
                for (const h of siguienteNivel)
                    hojas.add(h);
            }
            nivelActual = siguienteNivel;
        }
        return { yaTieneCierre: false, frontera: [...hojas] };
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        const { sesionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const cacheAgendas = new Map();
        const sembradas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        const reporte = [];
        let candidatos = 0;
        let encontrados = 0;
        let sinAgenda = 0;
        let sinMatchTexto = 0;
        for (const ini of sembradas) {
            if (ini.precluida === 1)
                continue;
            const puntoPresentacion = yield puntos_ordens_1.default.findByPk(ini.id_punto);
            if ((puntoPresentacion === null || puntoPresentacion === void 0 ? void 0 : puntoPresentacion.dispensa) === 1)
                continue;
            const { yaTieneCierre, frontera } = yield analizarCadena(Number(ini.id_punto));
            if (yaTieneCierre)
                continue;
            const filasFolio = porFolio.get(String(ini.folio_historico));
            if (!filasFolio)
                continue;
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            const estadoFinal = usables[usables.length - 1].estado;
            const fechaAprobacion = usables[usables.length - 1].fecha_aprobacion;
            if (estadoFinal !== 'Aprobada' || !fechaAprobacion)
                continue;
            candidatos++;
            let agendas = cacheAgendas.get(fechaAprobacion);
            if (!agendas) {
                agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fechaAprobacion, sesionId);
                cacheAgendas.set(fechaAprobacion, agendas);
            }
            if (agendas.length === 0) {
                sinAgenda++;
                reporte.push({ folio: ini.folio_historico, resultado: 'sin_agenda_real', fechaAprobacion });
                continue;
            }
            const puntosCandidatos = [];
            for (const ag of agendas) {
                const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
                for (const p of puntos)
                    puntosCandidatos.push({ id: p.id, texto: p.punto || '' });
            }
            const match = (0, matching_texto_1.elegirMejorCandidato)(usables[0].texto_iniciativa, puntosCandidatos);
            if (!match) {
                sinMatchTexto++;
                reporte.push({ folio: ini.folio_historico, resultado: 'sin_match_texto', fechaAprobacion, candidatos: puntosCandidatos.length });
                continue;
            }
            encontrados++;
            reporte.push({
                folio: ini.folio_historico,
                resultado: 'encontrado',
                fechaAprobacion,
                puntoCierre: match.puntoId,
                score: Number(match.score.toFixed(3)),
                frontera,
            });
            if (commit) {
                for (const origenId of frontera) {
                    yield iniciativas_estudio_1.default.create({ type: '1', punto_origen_id: origenId, punto_destino_id: match.puntoId, status: '3' });
                }
            }
        }
        fs_1.default.writeFileSync(REPORTE_PATH, JSON.stringify(reporte, null, 2), 'utf8');
        console.log('\n══════════ RESUMEN BÚSQUEDA DE CIERRE FALTANTE ══════════');
        console.log(`Candidatos (Aprobada, sin cierre): ${candidatos}`);
        console.log(`Cierre encontrado y agregado: ${encontrados}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
        console.log(`Sin agenda real en fecha de aprobación: ${sinAgenda}`);
        console.log(`Agenda existe, texto no calza con confianza: ${sinMatchTexto}`);
        console.log(`\nReporte: ${REPORTE_PATH}`);
        console.log('═══════════════════════════════════════════════════════\n');
        if (!commit)
            console.log('Corre con --commit para escribir de verdad.');
    });
}
main().then(() => process.exit(0)).catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
