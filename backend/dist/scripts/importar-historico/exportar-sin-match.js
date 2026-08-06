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
 * Exporta a Excel los folios que NO encontraron match de presentación, con
 * diagnóstico: mejor candidato encontrado (aunque no haya pasado el umbral),
 * su score y margen — para revisión manual de si es un caso genuinamente
 * sin evento real, o un match correcto que el umbral rechazó.
 *
 * Uso: ts-node src/scripts/importar-historico/exportar-sin-match.ts
 * Salida: backend/src/data/reportes-import-historico/sin-match.xlsx
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const exceljs_1 = __importDefault(require("exceljs"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const catalogos_1 = require("./catalogos");
const matching_texto_1 = require("./matching-texto");
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
const SALIDA = path_1.default.resolve(__dirname, '../../data/reportes-import-historico/sin-match.xlsx');
const DIPUTACION_PERMANENTE_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        const { sesionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const workbook = new exceljs_1.default.Workbook();
        const hoja = workbook.addWorksheet('Sin match');
        hoja.columns = [
            { header: 'Folio', key: 'folio', width: 8 },
            { header: 'Texto de la iniciativa (Excel)', key: 'texto', width: 60 },
            { header: 'Autor', key: 'autor', width: 30 },
            { header: 'Fecha de presentación', key: 'fecha', width: 16 },
            { header: 'Categoría', key: 'categoria', width: 18 },
            { header: '# candidatos en esa fecha', key: 'numCandidatos', width: 12 },
            { header: 'Mejor candidato (texto real)', key: 'mejorTexto', width: 60 },
            { header: 'Score mejor candidato', key: 'score', width: 12 },
            { header: 'Margen vs 2° lugar', key: 'margen', width: 12 },
            { header: 'ID punto candidato', key: 'puntoId', width: 12 },
        ];
        hoja.getRow(1).font = { bold: true };
        let procesados = 0;
        const cache = new Map();
        for (const [folio, filasFolio] of porFolio) {
            const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
            if (usables.length === 0)
                continue;
            const primeraFila = usables[0];
            const fecha = primeraFila.fecha_presentacion;
            let agendas = cache.get(fecha);
            if (!agendas) {
                agendas = fecha ? yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fecha, sesionId) : [];
                if (agendas.length === 0 && fecha) {
                    agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fecha, DIPUTACION_PERMANENTE_ID);
                }
                cache.set(fecha, agendas);
            }
            if (agendas.length === 0) {
                hoja.addRow({
                    folio,
                    texto: primeraFila.texto_iniciativa,
                    autor: primeraFila.autor,
                    fecha,
                    categoria: 'Sin agenda real en esa fecha',
                    numCandidatos: 0,
                    mejorTexto: '',
                    score: '',
                    margen: '',
                    puntoId: '',
                });
                procesados++;
                continue;
            }
            const candidatos = [];
            for (const ag of agendas) {
                const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
                for (const p of puntos)
                    candidatos.push({ id: p.id, texto: p.punto || '' });
            }
            const idf = (0, matching_texto_1.calcularIDF)(candidatos);
            const puntuados = candidatos
                .map((c) => ({ id: c.id, texto: c.texto, score: (0, matching_texto_1.puntuarCombinado)(primeraFila.texto_iniciativa, c.texto, idf) }))
                .sort((a, b) => b.score - a.score);
            const mejor = puntuados[0];
            const segundo = puntuados[1];
            const margen = segundo ? mejor.score - segundo.score : mejor.score;
            // solo folios que NO matchearon (score<0.35 o margen<0.08, igual que elegirMejorCandidato)
            if (mejor.score >= 0.35 && margen >= 0.08)
                continue;
            hoja.addRow({
                folio,
                texto: primeraFila.texto_iniciativa,
                autor: primeraFila.autor,
                fecha,
                categoria: 'Agenda existe, texto no calza con confianza',
                numCandidatos: candidatos.length,
                mejorTexto: mejor.texto,
                score: Number(mejor.score.toFixed(3)),
                margen: Number(margen.toFixed(3)),
                puntoId: mejor.id,
            });
            procesados++;
            if (procesados % 50 === 0)
                console.log(`  ... ${procesados} procesados`);
        }
        fs_1.default.mkdirSync(path_1.default.dirname(SALIDA), { recursive: true });
        yield workbook.xlsx.writeFile(SALIDA);
        console.log(`\n✔ Excel generado: ${SALIDA}`);
        console.log(`  Filas: ${procesados}`);
        process.exit(0);
    });
}
main().catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
