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
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const GRUPOS = {
    330: [331],
    580: [581],
    585: [596],
    1239: [1241],
    1259: [1261],
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [padre, hijos] of Object.entries(GRUPOS)) {
            const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: Number(padre) } });
            if (!ini) {
                console.log(`✖ No encontré folio_historico=${padre}`);
                continue;
            }
            yield ini.update({ folios_agrupados: hijos.join(',') });
            console.log(`folio ${padre} -> folios_agrupados = "${hijos.join(',')}"`);
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
