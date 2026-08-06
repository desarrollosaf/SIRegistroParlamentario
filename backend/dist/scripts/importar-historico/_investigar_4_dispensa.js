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
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const agendas_1 = __importDefault(require("../../models/agendas"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv'), 'utf8'), { columns: true, skip_empty_lines: true });
        const porFolio = new Map();
        for (const f of filas) {
            if (!porFolio.has(f.folio))
                porFolio.set(f.folio, []);
            porFolio.get(f.folio).push(f);
        }
        const dispensaFolios = [...porFolio.entries()]
            .filter(([folio, rs]) => {
            const usables = rs.filter((r) => !r.bandera.startsWith('Revisar'));
            return usables.length > 0 && usables.some((r) => r.tipo_evento === 'Dispensa');
        })
            .map(([folio]) => folio);
        const reconciliacion = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const reconPorFolio = new Map(reconciliacion.map((r) => [r.folio, r]));
        for (const folio of dispensaFolios) {
            const r = reconPorFolio.get(folio);
            if (!(r === null || r === void 0 ? void 0 : r.matchPresentacion))
                continue;
            const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: Number(folio) } });
            if (!ini)
                continue;
            const punto = yield puntos_ordens_1.default.findByPk(ini.id_punto);
            if (punto === null || punto === void 0 ? void 0 : punto.dispensa)
                continue; // ya tiene flag, no es de los 4
            const agenda = yield agendas_1.default.findByPk(ini.id_evento);
            const filaExcel = porFolio.get(folio).find((f) => f.tipo_evento === 'Dispensa');
            console.log('---');
            console.log('folio', folio, '| punto real', ini.id_punto, '| dispensa actual:', punto === null || punto === void 0 ? void 0 : punto.dispensa);
            console.log('  texto excel:', filaExcel.texto_iniciativa.slice(0, 90));
            console.log('  texto punto real:', (_a = punto === null || punto === void 0 ? void 0 : punto.punto) === null || _a === void 0 ? void 0 : _a.slice(0, 90));
            console.log('  score match:', r.matchPresentacion.score, '| margen:', r.matchPresentacion.margen);
            console.log('  fecha_presentacion excel:', filaExcel.fecha_presentacion, '| fecha_aprobacion excel:', filaExcel.fecha_aprobacion);
            console.log('  agenda real fecha:', agenda === null || agenda === void 0 ? void 0 : agenda.fecha, '| descripcion:', agenda === null || agenda === void 0 ? void 0 : agenda.descripcion);
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
