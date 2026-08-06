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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const agendas_por_fecha_1 = require("./agendas-por-fecha");
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const matching_texto_1 = require("./matching-texto");
function puntuarBigramasDebug(a, b) {
    const ta = (0, matching_texto_1.tokenizarBigramas)(a);
    const tb = (0, matching_texto_1.tokenizarBigramas)(b);
    let inter = 0;
    for (const bg of ta)
        if (tb.has(bg))
            inter++;
    return ta.size === 0 || tb.size === 0 ? 0 : (2 * inter) / (ta.size + tb.size);
}
const catalogos_1 = require("./catalogos");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv'), 'utf8'), { columns: true, skip_empty_lines: true });
        const { sesionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        for (const folioStr of ['45', '2', '801', '792']) {
            const fila = filas.find((f) => f.folio === folioStr);
            const agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fila.fecha_presentacion, sesionId);
            const candidatos = [];
            for (const ag of agendas) {
                const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
                for (const p of puntos)
                    candidatos.push({ id: p.id, texto: p.punto });
            }
            const match = (0, matching_texto_1.elegirMejorCandidato)(fila.texto_iniciativa, candidatos);
            console.log(`folio ${folioStr}:`, match ? `puntoId=${match.puntoId} score=${match.score.toFixed(3)} margen=${match.margen.toFixed(3)}` : 'SIN MATCH');
            if (folioStr === '45') {
                const idf = (0, matching_texto_1.calcularIDF)(candidatos);
                const puntuados = candidatos.map((c) => {
                    const st = (0, matching_texto_1.puntuarConIDF)(fila.texto_iniciativa, c.texto, idf);
                    const sb = puntuarBigramasDebug(fila.texto_iniciativa, c.texto);
                    return { id: c.id, scoreTokens: st, scoreBigramas: sb, combinado: 0.4 * st + 0.6 * sb, texto: c.texto };
                }).sort((a, b) => b.combinado - a.combinado);
                console.log('  top 5 (combinado | tokens | bigramas):');
                puntuados.slice(0, 5).forEach((p) => console.log('   ', p.id, p.combinado.toFixed(3), '|', p.scoreTokens.toFixed(3), '|', p.scoreBigramas.toFixed(3), '|', p.texto.slice(0, 70)));
            }
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
