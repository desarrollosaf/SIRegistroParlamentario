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
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const json = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json'), 'utf8'));
        const conMatch = json.filter((r) => r.matchPresentacion);
        console.log('Folios con match de presentación:', conMatch.length);
        let yaTienenIniciativa = 0;
        let noTienen = 0;
        const ejemplosConYa = [];
        for (const r of conMatch) {
            const puntoId = r.matchPresentacion.puntoId;
            const existente = yield inciativas_puntos_ordens_1.default.findOne({ where: { id_punto: puntoId } });
            if (existente) {
                yaTienenIniciativa++;
                if (ejemplosConYa.length < 5)
                    ejemplosConYa.push({ folio: r.folio, puntoId, existenteId: existente.id, existenteTexto: (_a = existente.iniciativa) === null || _a === void 0 ? void 0 : _a.slice(0, 80) });
            }
            else {
                noTienen++;
            }
        }
        console.log('Ya tienen fila en inciativas_puntos_ordens:', yaTienenIniciativa);
        console.log('NO tienen (habría que crearla):', noTienen);
        console.log('\nEjemplos de las que ya existen:');
        console.log(JSON.stringify(ejemplosConYa, null, 2));
        // distribución de confianza
        const porConfianza = {};
        for (const r of json) {
            porConfianza[r.confianza || r.estado] = (porConfianza[r.confianza || r.estado] || 0) + 1;
        }
        console.log('\nDistribución de confianza/estado:', porConfianza);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
