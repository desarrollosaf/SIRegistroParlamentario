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
const catalogos_1 = require("./catalogos");
function bigr(a, b) {
    const ta = (0, matching_texto_1.tokenizarBigramas)(a), tb = (0, matching_texto_1.tokenizarBigramas)(b);
    let inter = 0;
    for (const x of ta)
        if (tb.has(x))
            inter++;
    return ta.size === 0 || tb.size === 0 ? 0 : (2 * inter) / (ta.size + tb.size);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv'), 'utf8'), { columns: true, skip_empty_lines: true });
        const fila = filas.find((f) => f.folio === '1259');
        console.log('texto:', fila.texto_iniciativa.slice(0, 100));
        console.log('fecha_presentacion:', fila.fecha_presentacion);
        const { sesionId } = yield (0, catalogos_1.cargarTipoEventosReales)();
        const agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fila.fecha_presentacion, sesionId);
        const candidatos = [];
        for (const ag of agendas) {
            const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: ag.id } });
            for (const p of puntos)
                candidatos.push({ id: p.id, texto: p.punto });
        }
        console.log('candidatos:', candidatos.length);
        const idf = (0, matching_texto_1.calcularIDF)(candidatos);
        const puntuados = candidatos.map((c) => {
            const st = (0, matching_texto_1.puntuarConIDF)(fila.texto_iniciativa, c.texto, idf);
            const sb = bigr(fila.texto_iniciativa, c.texto);
            return { id: c.id, combinado: 0.4 * st + 0.6 * sb, texto: c.texto };
        }).sort((a, b) => b.combinado - a.combinado);
        puntuados.slice(0, 5).forEach((p) => console.log(' ', p.id, p.combinado.toFixed(3), '|', p.texto.slice(0, 90)));
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
