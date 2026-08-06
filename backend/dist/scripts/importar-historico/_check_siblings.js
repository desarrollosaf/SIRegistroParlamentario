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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const puntoId of [94, 521, 538, 3067, 3135]) {
            const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { id_punto: puntoId } });
            console.log(puntoId, '-> folio_historico existente:', ini === null || ini === void 0 ? void 0 : ini.folio_historico);
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
