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
 * Siembra real (escribe en BD) usando el resultado de reconciliar.ts, SOLO
 * sobre los folios que hicieron match de presentación (736) — nunca crea
 * agendas/puntos_ordens nuevos, siempre usa los reales ya existentes.
 *
 * Para cada folio con match:
 *  - Si YA existe inciativas_puntos_ordens (id_punto = match): NO se toca su
 *    texto ni su autor (ya son datos reales legítimos) — solo se le pone
 *    `folio_historico` para trazabilidad, y se le completa `puntos_comisiones`
 *    SOLO si no tenía ninguna todavía.
 *  - Si NO existe: se crea completa (iniciativa, autor clasificado,
 *    comisiones) apuntando al punto/agenda REAL que encontró el match.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-reconciliado.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const catalogos_1 = require("./catalogos");
const clasificar_autor_1 = require("./clasificar-autor");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const JSON_RECONCILIACION = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json');
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
        const catalogo = yield (0, catalogos_1.cargarCatalogosComisionesYProponentes)();
        let folioTag = 0;
        let comisionCompletada = 0;
        let creadaNueva = 0;
        let sinCambios = 0;
        let errores = 0;
        for (const r of conMatch) {
            const filasFolio = porFolio.get(r.folio);
            if (!filasFolio)
                continue;
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            const primeraFila = usables[0];
            const puntoId = r.matchPresentacion.puntoId;
            const agendaId = r.matchPresentacion.agendaId;
            try {
                yield registrocomisiones_1.default.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    let iniciativaExistente = yield inciativas_puntos_ordens_1.default.findOne({ where: { id_punto: puntoId }, transaction: t });
                    if (iniciativaExistente) {
                        let cambio = false;
                        if (!iniciativaExistente.folio_historico) {
                            yield iniciativaExistente.update({ folio_historico: Number(r.folio) }, { transaction: t });
                            folioTag++;
                            cambio = true;
                        }
                        const comisionExistente = yield puntos_comisiones_1.default.findOne({ where: { id_punto: puntoId }, transaction: t });
                        if (!comisionExistente) {
                            const comisionIds = resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo).length
                                ? resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo)
                                : resolverComisionesDeCelda(primeraFila.comision_reunion, catalogo);
                            if (comisionIds.length > 0) {
                                yield puntos_comisiones_1.default.create({ id_punto: puntoId, id_comision: `[${comisionIds.join(',')}]` }, { transaction: t });
                                yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: puntoId }, transaction: t });
                                comisionCompletada++;
                                cambio = true;
                            }
                        }
                        if (!cambio)
                            sinCambios++;
                    }
                    else {
                        const estadoFinal = usables[usables.length - 1].estado;
                        const nuevaIniciativa = yield inciativas_puntos_ordens_1.default.create({
                            id_punto: puntoId,
                            id_evento: agendaId,
                            iniciativa: limpiarTexto(primeraFila.texto_iniciativa),
                            status: null,
                            precluida: estadoFinal === 'Precluida' ? 1 : null,
                            publico: 0,
                            folio_historico: Number(r.folio),
                        }, { transaction: t });
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
                            yield puntos_comisiones_1.default.create({ id_punto: puntoId, id_comision: `[${comisionIds.join(',')}]` }, { transaction: t });
                            yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: puntoId }, transaction: t });
                        }
                        creadaNueva++;
                    }
                }));
            }
            catch (err) {
                errores++;
                console.error(`✖ Folio ${r.folio}: ${err.message}`);
            }
        }
        console.log('\n══════════ RESUMEN SIEMBRA (sobre datos reales) ══════════');
        console.log(`Folios tageados con folio_historico: ${folioTag}`);
        console.log(`Comisiones completadas (faltaban): ${comisionCompletada}`);
        console.log(`Iniciativas nuevas creadas (no existían): ${creadaNueva}`);
        console.log(`Sin cambios (ya estaban completas): ${sinCambios}`);
        console.log(`Errores: ${errores}`);
        console.log('═══════════════════════════════════════════════════════\n');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error fatal:', err);
    process.exit(1);
});
