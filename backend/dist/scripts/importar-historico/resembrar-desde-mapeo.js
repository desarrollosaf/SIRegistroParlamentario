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
 * Re-siembra inciativas_puntos_ordens / iniciativas_presenta /
 * puntos_comisiones / iniciativas_estudios usando el mapeo exportado por
 * exportar-mapeo.ts — es decir, reconstruye todo apuntando A LOS MISMOS
 * agendas y puntos_ordens que ya existían (no crea ninguno nuevo).
 *
 * Requiere: haber corrido borrar-historico.ts antes (o al menos que no
 * existan ya inciativas_puntos_ordens con esos folio_historico).
 *
 * Uso: ts-node src/scripts/importar-historico/resembrar-desde-mapeo.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const catalogos_1 = require("./catalogos");
const clasificar_autor_1 = require("./clasificar-autor");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const MAPEO_PATH = path_1.default.resolve(__dirname, '../../data/mapeo-puntos-historico.json');
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
        const mapeo = JSON.parse(fs_1.default.readFileSync(MAPEO_PATH, 'utf8'));
        const mapeoPorFolio = new Map(mapeo.map((m) => [m.folio, m]));
        const catalogo = yield (0, catalogos_1.cargarCatalogos)();
        const folios = new Map();
        for (const fila of filas) {
            if (!folios.has(fila.folio))
                folios.set(fila.folio, []);
            folios.get(fila.folio).push(fila);
        }
        let creados = 0;
        let sinMapeo = 0;
        let errores = 0;
        for (const [folioStr, filasFolio] of folios) {
            const folioNum = Number(folioStr);
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            const m = mapeoPorFolio.get(folioNum);
            if (!m) {
                sinMapeo++;
                continue; // folio que en la siembra original no se sembró (ej. estaba en "Revisar")
            }
            const primeraFila = usables[0];
            const estadoFinal = usables[usables.length - 1].estado;
            try {
                yield registrocomisiones_1.default.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    const iniciativaPO = yield inciativas_puntos_ordens_1.default.create({
                        id_punto: Number(m.puntoPresentacionId),
                        id_evento: m.sesionAgendaId,
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
                        yield puntos_comisiones_1.default.create({ id_punto: Number(m.puntoPresentacionId), id_comision: `[${comisionIds.join(',')}]` }, { transaction: t });
                        yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: Number(m.puntoPresentacionId) }, transaction: t });
                    }
                    let origenId = Number(m.puntoPresentacionId);
                    for (const paso of m.pasos) {
                        yield iniciativas_estudio_1.default.create({ type: '1', punto_origen_id: origenId, punto_destino_id: paso.puntoId, status: paso.status }, { transaction: t });
                        if (!paso.esCierre)
                            origenId = paso.puntoId;
                    }
                }));
                creados++;
                if (creados % 200 === 0)
                    console.log(`  ... ${creados} folios re-sembrados`);
            }
            catch (err) {
                errores++;
                console.error(`✖ Folio ${folioStr}: ${err.message}`);
            }
        }
        console.log('\n══════════ RESUMEN RE-SIEMBRA ══════════');
        console.log(`Folios re-sembrados: ${creados}`);
        console.log(`Folios sin mapeo previo (no se sembraron): ${sinMapeo}`);
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
