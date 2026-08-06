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
 * Siembra real (escribe en BD) del histórico de iniciativas.
 *
 * Requiere haber corrido antes convertir-excel.ts (genera el CSV) y revisado
 * el reporte en seco (reporte.ts). NO hace nada sin la bandera --commit: sin
 * ella solo imprime instrucciones y termina, para evitar escrituras
 * accidentales.
 *
 * Uso:
 *   ts-node src/scripts/importar-historico/importar.ts --commit
 *   ts-node src/scripts/importar-historico/importar.ts --commit --limite 20   (solo procesa los primeros N folios, útil para probar)
 *
 * ─── Simplificaciones deliberadas frente al flujo real de controllers/agenda.ts ───
 * 1. Se crea UNA sola Agenda por combinación (fecha, tipo_evento), compartida
 *    entre todos los folios de ese día — igual que en la operación real, donde
 *    varias iniciativas se ven en la misma reunión.
 * 2. Se crea un evento "Sesión" de presentación (en Fecha de presentación) por
 *    cada folio, y ahí se registra el turno a comisión inicial — el Excel no
 *    distingue el recinto de cada reunión de comisión, así que TODOS los
 *    eventos (Sesión y Comisión) usan la misma sede resuelta en catalogos.ts.
 * 3. El encadenamiento de `iniciativas_estudios` (turno→estudio→dictamen) usa
 *    siempre type "1" con status 1 (turnado/en estudio) o 6 (dictamen
 *    presentado, replicando el patrón real visto en agenda.ts:1229-1324). NO
 *    se reconstruye el subsistema de votación por diputado (asistencia_votos,
 *    votos_punto): el Excel no trae voto por voto.
 * 4. Cierre: como no hay datos de votación real, "Aprobada" se cierra con un
 *    nodo `iniciativas_estudios` status "3" (el mismo status que usan las
 *    consultas de reporte para detectar cierre/aprobación) apuntando al
 *    último punto de la cadena, sin generar registros de voto individuales.
 *    "Precluida" se marca con `inciativas_puntos_ordens.precluida = 1`.
 *    "En estudio" no se cierra: la cadena queda abierta, como en la realidad.
 * 5. Autor: se guarda el texto completo original en `id_presenta` (campo
 *    libre) y solo se clasifica `id_tipo_presenta` contra el catálogo de 19
 *    proponentes — no se intenta separar autores conjuntos en varias filas.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const agendas_1 = __importDefault(require("../../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const catalogos_1 = require("./catalogos");
const clasificar_autor_1 = require("./clasificar-autor");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const DESCRIPCION_IMPORT = 'Importación histórica LXII Legislatura';
/**
 * Sanea texto libre del Excel antes de insertarlo: quita marcas diacríticas
 * "sueltas" (acentos duplicados por artefactos de copiar/pegar, ej. "así́")
 * que no representan un carácter latin1 válido y revientan columnas legacy
 * con collation latin1_swedish_ci mezcladas en el esquema.
 */
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
function obtenerOCrearAgenda(fechaISO, tipoEventoId, catalogo, cache) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `${fechaISO}|${tipoEventoId}`;
        const enCache = cache.get(key);
        if (enCache)
            return enCache;
        let agenda = yield agendas_1.default.findOne({
            where: { fecha: fechaISO, tipo_evento_id: tipoEventoId, sede_id: catalogo.sedeId },
        });
        if (!agenda) {
            agenda = yield agendas_1.default.create({
                fecha: fechaISO,
                sede_id: catalogo.sedeId,
                tipo_evento_id: tipoEventoId,
                descripcion: DESCRIPCION_IMPORT,
                status: 1,
            });
        }
        cache.set(key, agenda.id);
        return agenda.id;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        if (!commit) {
            console.log('Este script solo escribe en BD con la bandera --commit.\n' +
                'Antes de eso corre: ts-node src/scripts/importar-historico/reporte.ts (ver qué se va a sembrar sin tocar nada).\n' +
                'Ejemplo: ts-node src/scripts/importar-historico/importar.ts --commit --limite 20');
            process.exit(0);
        }
        const limiteIdx = process.argv.indexOf('--limite');
        const limite = limiteIdx >= 0 ? parseInt(process.argv[limiteIdx + 1], 10) : Infinity;
        if (!fs_1.default.existsSync(CSV_PATH)) {
            throw new Error(`No existe ${CSV_PATH}. Corre primero convertir-excel.ts`);
        }
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), {
            columns: true,
            skip_empty_lines: true,
        });
        const catalogo = yield (0, catalogos_1.cargarCatalogos)();
        console.log(`Sede: "${catalogo.sedeNombre}" | Comisión: ${catalogo.tipoEventoComisionId} | Sesión: ${catalogo.tipoEventoSesionId}`);
        const folios = new Map();
        for (const fila of filas) {
            if (!folios.has(fila.folio))
                folios.set(fila.folio, []);
            folios.get(fila.folio).push(fila);
        }
        const agendaCache = new Map();
        let creados = 0;
        let yaExistian = 0;
        let saltadosSinFilasUtiles = 0;
        let errores = 0;
        let procesados = 0;
        for (const [folio, filasFolio] of folios) {
            if (procesados >= limite)
                break;
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0) {
                saltadosSinFilasUtiles++;
                continue;
            }
            const folioNum = Number(folio);
            const yaImportado = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: folioNum } });
            if (yaImportado) {
                yaExistian++;
                continue;
            }
            procesados++;
            const primeraFila = usables[0];
            const estadoFinal = usables[usables.length - 1].estado;
            try {
                yield registrocomisiones_1.default.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    const sesionAgendaId = yield obtenerOCrearAgenda(primeraFila.fecha_presentacion, catalogo.tipoEventoSesionId, catalogo, agendaCache);
                    const puntoPresentacion = yield puntos_ordens_1.default.create({
                        id_evento: sesionAgendaId,
                        punto: limpiarTexto(primeraFila.texto_iniciativa),
                        observaciones: limpiarTexto(primeraFila.materia),
                        status: 1,
                        editado: 0,
                    }, { transaction: t });
                    const iniciativaPO = yield inciativas_puntos_ordens_1.default.create({
                        id_punto: puntoPresentacion.id,
                        id_evento: sesionAgendaId,
                        iniciativa: limpiarTexto(primeraFila.texto_iniciativa),
                        status: null,
                        precluida: estadoFinal === 'Precluida' ? 1 : null,
                        publico: 0,
                        folio_historico: folioNum,
                    }, { transaction: t });
                    const clasif = (0, clasificar_autor_1.clasificarAutor)(primeraFila.autor, catalogo);
                    yield iniciativaspresenta_1.default.create({
                        id_iniciativa: iniciativaPO.id,
                        id_tipo_presenta: clasif.tipoPresentaId,
                        id_presenta: truncar(limpiarTexto(primeraFila.autor) || '', 255),
                    }, { transaction: t });
                    const comisionIds = resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo).length
                        ? resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo)
                        : resolverComisionesDeCelda(primeraFila.comision_reunion, catalogo);
                    if (comisionIds.length > 0) {
                        yield puntos_comisiones_1.default.create({ id_punto: puntoPresentacion.id, id_comision: `[${comisionIds.join(',')}]` }, { transaction: t });
                        yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: puntoPresentacion.id }, transaction: t });
                    }
                    let puntoActualId = puntoPresentacion.id;
                    for (const fila of usables) {
                        if (fila.tipo_evento === 'Dispensa') {
                            yield puntos_ordens_1.default.update({ dispensa: 1 }, { where: { id: puntoPresentacion.id }, transaction: t });
                            continue;
                        }
                        if (fila.tipo_evento !== 'Estudio' && fila.tipo_evento !== 'Dictamen')
                            continue; // "Sin reunión registrada"
                        const fechaEvento = fila.fecha_evento || primeraFila.fecha_presentacion;
                        const comisionAgendaId = yield obtenerOCrearAgenda(fechaEvento, catalogo.tipoEventoComisionId, catalogo, agendaCache);
                        const nuevoPunto = yield puntos_ordens_1.default.create({
                            id_evento: comisionAgendaId,
                            punto: limpiarTexto(primeraFila.texto_iniciativa),
                            observaciones: `Histórico: reunión de ${fila.tipo_evento} (folio ${folio})`,
                            status: 1,
                            editado: 0,
                        }, { transaction: t });
                        yield iniciativas_estudio_1.default.create({
                            type: '1',
                            punto_origen_id: puntoActualId,
                            punto_destino_id: nuevoPunto.id,
                            status: fila.tipo_evento === 'Dictamen' ? 6 : 1,
                        }, { transaction: t });
                        if (fila.tipo_evento === 'Dictamen') {
                            yield puntos_ordens_1.default.update({ id_dictamen: nuevoPunto.id }, { where: { id: puntoActualId }, transaction: t });
                        }
                        puntoActualId = nuevoPunto.id;
                    }
                    if (estadoFinal === 'Aprobada') {
                        yield iniciativas_estudio_1.default.create({
                            type: '1',
                            punto_origen_id: puntoActualId,
                            punto_destino_id: puntoActualId,
                            status: '3',
                        }, { transaction: t });
                    }
                }));
                creados++;
                if (creados % 50 === 0)
                    console.log(`  ... ${creados} folios sembrados`);
            }
            catch (err) {
                errores++;
                console.error(`✖ Folio ${folio}: ${err.message}`);
            }
        }
        console.log('\n══════════ RESUMEN SIEMBRA ══════════');
        console.log(`Folios sembrados: ${creados}`);
        console.log(`Folios ya existentes (saltados, idempotencia): ${yaExistian}`);
        console.log(`Folios sin filas utilizables (solo "Revisar"): ${saltadosSinFilasUtiles}`);
        console.log(`Errores: ${errores}`);
        console.log('══════════════════════════════════════\n');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error fatal:', err);
    process.exit(1);
});
