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
 * Siembra completa (tabla ya vacía tras borrar-todo-para-resembrar.ts):
 * para cada folio con match de presentación real, crea la iniciativa +
 * autor + comisión turnada, y ADEMÁS reconstruye la cadena de
 * Estudio/Dictamen/Cierre buscando, en las fechas que trae el Excel
 * (Fecha del evento, Fecha de aprobación), el punto real correspondiente
 * por texto — igual mecanismo que la presentación. Los puntos_ordens reales
 * nunca se borraron, solo se habían borrado los ENLACES (iniciativas_estudios)
 * que los conectaban, así que se pueden re-encontrar y re-enlazar.
 *
 * Simplificación deliberada: no reconstruye `expedientes` (agrupación de
 * varias iniciativas en un solo trámite) — cada folio se enlaza de forma
 * directa (type '1'). Si varios folios convergen en el mismo punto destino,
 * eso ya refleja que se estudiaron juntos, aunque sin el registro formal de
 * Expediente que existía antes.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-completo.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const catalogos_1 = require("./catalogos");
const clasificar_autor_1 = require("./clasificar-autor");
const matching_texto_1 = require("./matching-texto");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const JSON_RECONCILIACION = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json');
const REPORTE_CADENA = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/cadena-reconstruida.json');
function limpiarTexto(valor) {
    if (!valor)
        return null;
    return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}
function truncar(valor, maxLargo) {
    return valor.length > maxLargo ? valor.slice(0, maxLargo - 1) + '…' : valor;
}
function resolverComisionesDeCelda(celdaConBloques, catalogo) {
    if (!celdaConBloques)
        return [];
    const ids = new Set();
    for (const bloque of celdaConBloques.split('|').filter(Boolean)) {
        for (const nombre of (0, catalogos_1.tokenizarBloqueComisiones)(bloque, catalogo)) {
            const encontrada = (0, catalogos_1.resolverComision)(nombre, catalogo);
            if (encontrada)
                ids.add(encontrada.id);
        }
    }
    return [...ids];
}
function buscarPuntoRealPorFechaYTexto(fecha, tipoEventoId, texto, cache) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fecha)
            return null;
        const key = `${fecha}|${tipoEventoId}`;
        let agendas = cache.get(key);
        if (!agendas) {
            agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fecha, tipoEventoId);
            cache.set(key, agendas);
        }
        if (agendas.length === 0)
            return null;
        const candidatos = [];
        for (const ag of agendas) {
            const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
            for (const p of puntos)
                candidatos.push({ id: p.id, texto: p.punto || '', agendaId: ag.id });
        }
        const match = (0, matching_texto_1.elegirMejorCandidato)(texto, candidatos);
        if (!match)
            return null;
        const agendaId = candidatos.find((c) => c.id === match.puntoId).agendaId;
        return { puntoId: match.puntoId, agendaId, score: match.score };
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        if (!commit) {
            console.log('Corre con --commit para escribir. Sin esa bandera esto no hace nada.');
            process.exit(0);
        }
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        const reconciliacion = JSON.parse(fs_1.default.readFileSync(JSON_RECONCILIACION, 'utf8'));
        const conMatch = reconciliacion.filter((r) => r.matchPresentacion);
        console.log(`Folios con match de presentación a sembrar: ${conMatch.length}`);
        const catalogo = yield (0, catalogos_1.cargarCatalogosComisionesYProponentes)();
        const { sesionId, comisionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const cacheAgendas = new Map();
        const reporteCadena = [];
        let creadas = 0;
        let comisionesAsignadas = 0;
        let eslabonesEstudioDictamen = 0;
        let eslabonesCierre = 0;
        let sinNingunEslabon = 0;
        let errores = 0;
        for (const r of conMatch) {
            const filasFolio = porFolio.get(r.folio);
            if (!filasFolio)
                continue;
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            const primeraFila = usables[0];
            const estadoFinal = usables[usables.length - 1].estado;
            const puntoPresentacionId = r.matchPresentacion.puntoId;
            const agendaPresentacionId = r.matchPresentacion.agendaId;
            try {
                const detalleFolio = { folio: r.folio, puntoPresentacionId, eslabones: [] };
                yield registrocomisiones_1.default.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    const nuevaIniciativa = yield inciativas_puntos_ordens_1.default.create({
                        id_punto: puntoPresentacionId,
                        id_evento: agendaPresentacionId,
                        iniciativa: limpiarTexto(primeraFila.texto_iniciativa),
                        status: null,
                        precluida: estadoFinal === 'Precluida' ? 1 : null,
                        publico: 0,
                        folio_historico: Number(r.folio),
                    }, { transaction: t });
                    creadas++;
                    const clasif = (0, clasificar_autor_1.clasificarAutor)(primeraFila.autor, catalogo);
                    yield iniciativaspresenta_1.default.create({
                        id_iniciativa: nuevaIniciativa.id,
                        id_tipo_presenta: clasif.tipoPresentaId,
                        id_presenta: truncar(limpiarTexto(primeraFila.autor) || '', 255),
                    }, { transaction: t });
                    const comisionIds = resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo).length
                        ? resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo)
                        : resolverComisionesDeCelda(primeraFila.comision_reunion, catalogo);
                    if (comisionIds.length > 0) {
                        yield puntos_comisiones_1.default.create({ id_punto: puntoPresentacionId, id_comision: `[${comisionIds.join(',')}]` }, { transaction: t });
                        yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: puntoPresentacionId }, transaction: t });
                        comisionesAsignadas++;
                    }
                    // --- reconstruir cadena Estudio/Dictamen ---
                    let origenId = puntoPresentacionId;
                    let huboEslabon = false;
                    for (const fila of usables) {
                        if (fila.tipo_evento !== 'Estudio' && fila.tipo_evento !== 'Dictamen')
                            continue;
                        const encontrado = yield buscarPuntoRealPorFechaYTexto(fila.fecha_evento, comisionId, primeraFila.texto_iniciativa, cacheAgendas);
                        if (!encontrado)
                            continue;
                        yield iniciativas_estudio_1.default.create({
                            type: '1',
                            punto_origen_id: origenId,
                            punto_destino_id: encontrado.puntoId,
                            status: fila.tipo_evento === 'Dictamen' ? 6 : 1,
                        }, { transaction: t });
                        if (fila.tipo_evento === 'Dictamen') {
                            yield puntos_ordens_1.default.update({ id_dictamen: encontrado.puntoId }, { where: { id: origenId }, transaction: t });
                        }
                        detalleFolio.eslabones.push({ etapa: fila.tipo_evento, fecha: fila.fecha_evento, puntoId: encontrado.puntoId, score: encontrado.score });
                        origenId = encontrado.puntoId;
                        huboEslabon = true;
                        eslabonesEstudioDictamen++;
                    }
                    // --- cierre real en Sesión (fecha de aprobación) ---
                    const fechaAprobacion = usables[usables.length - 1].fecha_aprobacion;
                    if (estadoFinal === 'Aprobada' && fechaAprobacion) {
                        const cierre = yield buscarPuntoRealPorFechaYTexto(fechaAprobacion, sesionId, primeraFila.texto_iniciativa, cacheAgendas);
                        if (cierre && cierre.puntoId !== origenId) {
                            yield iniciativas_estudio_1.default.create({ type: '1', punto_origen_id: origenId, punto_destino_id: cierre.puntoId, status: '3' }, { transaction: t });
                            detalleFolio.eslabones.push({ etapa: 'Cierre', fecha: fechaAprobacion, puntoId: cierre.puntoId, score: cierre.score });
                            huboEslabon = true;
                            eslabonesCierre++;
                        }
                    }
                    if (!huboEslabon)
                        sinNingunEslabon++;
                }));
                reporteCadena.push(detalleFolio);
            }
            catch (err) {
                errores++;
                console.error(`✖ Folio ${r.folio}: ${err.message}`);
            }
            if (creadas % 200 === 0)
                console.log(`  ... ${creadas} folios sembrados`);
        }
        fs_1.default.writeFileSync(REPORTE_CADENA, JSON.stringify(reporteCadena, null, 2), 'utf8');
        console.log('\n══════════ RESUMEN SIEMBRA COMPLETA ══════════');
        console.log(`Iniciativas creadas: ${creadas}`);
        console.log(`Comisiones asignadas: ${comisionesAsignadas}`);
        console.log(`Eslabones Estudio/Dictamen reconstruidos: ${eslabonesEstudioDictamen}`);
        console.log(`Eslabones de cierre (Sesión de votación) reconstruidos: ${eslabonesCierre}`);
        console.log(`Folios sin ningún eslabón reconstruible: ${sinNingunEslabon}`);
        console.log(`Errores: ${errores}`);
        console.log(`\nDetalle de cadenas: ${REPORTE_CADENA}`);
        console.log('══════════════════════════════════════════════\n');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error fatal:', err);
    process.exit(1);
});
