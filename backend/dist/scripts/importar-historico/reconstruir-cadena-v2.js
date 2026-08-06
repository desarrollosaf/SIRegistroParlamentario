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
 * Reconstrucción de cadena Estudio/Dictamen/Cierre v2, con detección de
 * EXPEDIENTES reales: cuando varias iniciativas (folios) comparten la misma
 * fecha_evento + tipo_evento y convergen en el mismo punto real de comisión
 * (aunque el texto de ese punto sea genérico tipo "paquete de iniciativas
 * en materia de..."), se crea un Expediente real (`expedientes` +
 * `expedientes_estudio_puntos`, apuntando siempre a los puntos ORIGINALES
 * de presentación de cada folio agrupado — igual que el patrón real
 * encontrado en la BD) y se cuelgan de él, vía `iniciativas_estudios`
 * type='2', tantos destinos como etapas reales se encuentren (comisión de
 * estudio, comisión de dictamen, sesión de cierre) — todas como aristas
 * directas desde el expediente, no encadenadas entre sí (así es como está
 * la data real: un Expediente puede tener varias aristas type='2' a puntos
 * distintos).
 *
 * Reglas de negocio confirmadas por el usuario:
 *  - Solo se intenta enlazar la Sesión de "Fecha de aprobación" cuando
 *    hubo un paso de tipo Dictamen (no para folios que solo llegaron a
 *    Estudio).
 *  - Requiere que sembrar-completo.ts ya haya corrido (736 iniciativas con
 *    folio_historico) y que iniciativas_estudios/expedientes estén vacías
 *    (se limpiaron antes de correr este script).
 *
 * Uso: ts-node src/scripts/importar-historico/reconstruir-cadena-v2.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const sync_1 = require("csv-parse/sync");
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const expediente_1 = __importDefault(require("../../models/expediente"));
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const catalogos_1 = require("./catalogos");
const matching_texto_1 = require("./matching-texto");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const REPORTE_PATH = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/cadena-reconstruida-v2.json');
const UMBRAL_DIRECTO = 0.35; // para folio solo (sin cohorte), igual que la presentación
const MARGEN_DIRECTO = 0.08;
const UMBRAL_RESCATE = 0.12; // para sumar a un folio a un bundle ya confirmado por otros
function obtenerCandidatos(fecha, tipoEventoId, cache) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `${fecha}|${tipoEventoId}`;
        let agendas = cache.get(key);
        if (!agendas) {
            agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fecha, tipoEventoId);
            cache.set(key, agendas);
        }
        const candidatos = [];
        for (const ag of agendas) {
            const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
            for (const p of puntos)
                candidatos.push({ id: p.id, texto: p.punto || '', agendaId: ag.id });
        }
        return candidatos;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        if (!commit) {
            console.log('Corre con --commit para escribir.');
            process.exit(0);
        }
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        const { sesionId, comisionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const sembradas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        const folioAPuntoPresentacion = new Map();
        for (const s of sembradas)
            folioAPuntoPresentacion.set(String(s.folio_historico), s.id_punto);
        console.log(`Iniciativas ya sembradas a procesar: ${folioAPuntoPresentacion.size}`);
        // folio -> punto "actual" en la cadena (arranca en su presentación real)
        const puntoActualPorFolio = new Map(folioAPuntoPresentacion);
        const expedienteActualPorFolio = new Map();
        const llegoADictamenPorFolio = new Set();
        const cacheAgendas = new Map();
        const reporte = [];
        let expedientesCreados = 0;
        let aristasDirectas = 0;
        let aristasPorExpediente = 0;
        let folioNoResuelto = 0;
        function procesarEtapa(tipoEvento, tipoEventoIdReal) {
            return __awaiter(this, void 0, void 0, function* () {
                // agrupar folios elegibles por fecha de esta etapa
                const cohortes = new Map();
                for (const [folio, filasFolio] of porFolio) {
                    if (!folioAPuntoPresentacion.has(folio))
                        continue;
                    const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
                    if (usables.length === 0)
                        continue;
                    let fecha;
                    if (tipoEvento === 'Cierre') {
                        if (!llegoADictamenPorFolio.has(folio))
                            continue; // regla: cierre solo si hubo Dictamen
                        const estadoFinal = usables[usables.length - 1].estado;
                        if (estadoFinal !== 'Aprobada')
                            continue;
                        fecha = usables[usables.length - 1].fecha_aprobacion;
                    }
                    else {
                        const fila = usables.find((f) => f.tipo_evento === tipoEvento);
                        if (!fila)
                            continue;
                        fecha = fila.fecha_evento;
                    }
                    if (!fecha)
                        continue;
                    // Seguridad para correr contra un server con datos reales preexistentes:
                    // si YA existe un enlace real desde este punto (de antes de correr este
                    // script), no crear uno nuevo — avanzar el estado con el que ya existe.
                    const origenActual = puntoActualPorFolio.get(folio);
                    const existente = yield iniciativas_estudio_1.default.findOne({ where: { punto_origen_id: origenActual } });
                    if (existente) {
                        puntoActualPorFolio.set(folio, Number(existente.punto_destino_id));
                        if (String(existente.status) === '2')
                            llegoADictamenPorFolio.add(folio);
                        continue;
                    }
                    const key = fecha;
                    if (!cohortes.has(key))
                        cohortes.set(key, []);
                    cohortes.get(key).push({
                        folio,
                        puntoOrigenId: origenActual,
                        texto: usables[0].texto_iniciativa,
                        yaExpedienteId: expedienteActualPorFolio.get(folio),
                    });
                }
                for (const [fecha, miembros] of cohortes) {
                    const candidatos = yield obtenerCandidatos(fecha, tipoEventoIdReal, cacheAgendas);
                    if (candidatos.length === 0)
                        continue;
                    // match individual estricto por miembro (IDF + bigramas, igual que la presentación)
                    const idf = (0, matching_texto_1.calcularIDF)(candidatos);
                    const matchPorMiembro = new Map();
                    for (const m of miembros) {
                        const puntuados = candidatos
                            .map((c) => ({ id: c.id, agendaId: c.agendaId, score: (0, matching_texto_1.puntuarConIDF)(m.texto, c.texto, idf) }))
                            .sort((a, b) => b.score - a.score);
                        const mejor = puntuados[0];
                        const segundo = puntuados[1];
                        const margen = segundo ? mejor.score - segundo.score : mejor.score;
                        if (mejor && mejor.score >= UMBRAL_DIRECTO && margen >= MARGEN_DIRECTO) {
                            matchPorMiembro.set(m.folio, { puntoId: mejor.id, agendaId: mejor.agendaId, score: mejor.score });
                        }
                    }
                    // agrupar por punto destino resultante
                    const porPunto = new Map();
                    for (const [folio, m] of matchPorMiembro) {
                        if (!porPunto.has(m.puntoId))
                            porPunto.set(m.puntoId, []);
                        porPunto.get(m.puntoId).push(folio);
                    }
                    // rescate: miembros sin match directo, revisar si calzan (score bajo) contra un punto ya confirmado por ≥2
                    const puntosConfirmados = [...porPunto.entries()].filter(([, folios]) => folios.length >= 2).map(([puntoId]) => puntoId);
                    for (const m of miembros) {
                        if (matchPorMiembro.has(m.folio))
                            continue;
                        for (const puntoId of puntosConfirmados) {
                            const cand = candidatos.find((c) => c.id === puntoId);
                            const score = (0, matching_texto_1.puntuarConIDF)(m.texto, cand.texto, idf);
                            if (score >= UMBRAL_RESCATE) {
                                porPunto.get(puntoId).push(m.folio);
                                matchPorMiembro.set(m.folio, { puntoId, agendaId: cand.agendaId, score });
                                break;
                            }
                        }
                    }
                    // escribir aristas
                    for (const [puntoId, folios] of porPunto) {
                        // Confirmado contra controllers/diputados.ts (getifnini, el que arma el
                        // timeline real): status "1"=Estudio, "2"=Dictamen, "3"=Cierre.
                        const status = tipoEvento === 'Dictamen' ? '2' : tipoEvento === 'Cierre' ? '3' : '1';
                        if (folios.length === 1) {
                            const folio = folios[0];
                            const miembro = miembros.find((mm) => mm.folio === folio);
                            yield iniciativas_estudio_1.default.create({ type: '1', punto_origen_id: miembro.puntoOrigenId, punto_destino_id: puntoId, status });
                            aristasDirectas++;
                            puntoActualPorFolio.set(folio, puntoId);
                            reporte.push({ folio, etapa: tipoEvento, fecha, puntoId, via: 'directo' });
                        }
                        else {
                            // ¿ya venían agrupados en el mismo expediente desde una etapa anterior?
                            const expedientesPrevios = new Set(folios.map((f) => expedienteActualPorFolio.get(f)).filter(Boolean));
                            let expedienteId;
                            if (expedientesPrevios.size === 1 && !expedientesPrevios.has(undefined)) {
                                expedienteId = [...expedientesPrevios][0];
                            }
                            else {
                                // evento_comision_id es INTEGER en el modelo pero agendas.id es UUID
                                // en la data real ese campo no se usa como FK estricta — se deja null.
                                const exp = yield expediente_1.default.create({ evento_comision_id: null, descripcion: 'Iniciativas en conjunto' });
                                expedienteId = Number(exp.id);
                                expedientesCreados++;
                                for (const folio of folios) {
                                    const miembro = miembros.find((mm) => mm.folio === folio);
                                    yield expedientes_estudio_puntos_1.default.create({ expediente_id: expedienteId, punto_origen_sesion_id: folioAPuntoPresentacion.get(folio) });
                                }
                            }
                            yield iniciativas_estudio_1.default.create({ type: '2', punto_origen_id: expedienteId, punto_destino_id: puntoId, status });
                            aristasPorExpediente++;
                            for (const folio of folios) {
                                expedienteActualPorFolio.set(folio, expedienteId);
                                puntoActualPorFolio.set(folio, puntoId);
                                reporte.push({ folio, etapa: tipoEvento, fecha, puntoId, via: 'expediente', expedienteId });
                            }
                        }
                        if (tipoEvento === 'Dictamen') {
                            for (const folio of folios) {
                                llegoADictamenPorFolio.add(folio);
                                const miembro = miembros.find((mm) => mm.folio === folio);
                                yield puntos_ordens_1.default.update({ id_dictamen: puntoId }, { where: { id: miembro.puntoOrigenId } });
                            }
                        }
                    }
                }
            });
        }
        yield procesarEtapa('Estudio', comisionId);
        yield procesarEtapa('Dictamen', comisionId);
        yield procesarEtapa('Cierre', sesionId);
        const folioConEslabon = new Set(reporte.map((r) => r.folio));
        folioNoResuelto = folioAPuntoPresentacion.size - folioConEslabon.size;
        fs_1.default.writeFileSync(REPORTE_PATH, JSON.stringify(reporte, null, 2), 'utf8');
        console.log('\n══════════ RESUMEN CADENA v2 ══════════');
        console.log(`Expedientes reales creados: ${expedientesCreados}`);
        console.log(`Aristas directas (folio solo): ${aristasDirectas}`);
        console.log(`Aristas vía expediente (agrupadas): ${aristasPorExpediente}`);
        console.log(`Folios con al menos un eslabón: ${folioConEslabon.size}`);
        console.log(`Folios sin ningún eslabón: ${folioNoResuelto}`);
        console.log(`\nReporte: ${REPORTE_PATH}`);
        console.log('════════════════════════════════════════\n');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
