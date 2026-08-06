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
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
        console.log('Folios usables con Dispensa:', dispensaFolios.length);
        const reconciliacion = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const reconPorFolio = new Map(reconciliacion.map((r) => [r.folio, r]));
        let matcheados = 0, sinMatch = 0;
        for (const folio of dispensaFolios) {
            const r = reconPorFolio.get(folio);
            if (r === null || r === void 0 ? void 0 : r.matchPresentacion)
                matcheados++;
            else
                sinMatch++;
        }
        console.log('Dispensa con match de presentación:', matcheados, '| sin match:', sinMatch);
        // de los matcheados, cuantos estan sembrados y tienen dispensa=1 en su punto
        let sembrados = 0, conFlagDispensa = 0, conCierreORama = 0;
        for (const folio of dispensaFolios) {
            const r = reconPorFolio.get(folio);
            if (!(r === null || r === void 0 ? void 0 : r.matchPresentacion))
                continue;
            const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: Number(folio) } });
            if (!ini)
                continue;
            sembrados++;
            const punto = yield puntos_ordens_1.default.findByPk(ini.id_punto);
            if (punto === null || punto === void 0 ? void 0 : punto.dispensa)
                conFlagDispensa++;
            const est = yield iniciativas_estudio_1.default.findOne({ where: { punto_origen_id: ini.id_punto } });
            if (est)
                conCierreORama++;
        }
        console.log('Dispensa matcheadas y sembradas (folio_historico):', sembrados);
        console.log('  con flag puntos_ordens.dispensa=1:', conFlagDispensa);
        console.log('  con algun eslabon iniciativas_estudios (cierre):', conCierreORama);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
