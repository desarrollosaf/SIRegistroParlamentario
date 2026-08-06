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
const DIPUTACION_PERMANENTE_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const sinAgenda = data.filter((r) => r.estado === 'sin_agenda_presentacion');
        console.log('sin_agenda_presentacion:', sinAgenda.length);
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv'), 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        let conDiputacionPermanente = 0;
        for (const r of sinAgenda) {
            const fila = (_a = porFolio.get(r.folio)) === null || _a === void 0 ? void 0 : _a[0];
            if (!fila)
                continue;
            const agendas = yield (0, agendas_por_fecha_1.buscarAgendasPorFecha)(fila.fecha_presentacion, DIPUTACION_PERMANENTE_ID);
            if (agendas.length > 0)
                conDiputacionPermanente++;
        }
        console.log('de esos, con agenda real tipo Diputación Permanente en esa fecha:', conDiputacionPermanente);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
