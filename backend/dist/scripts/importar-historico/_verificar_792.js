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
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: 792 } });
        console.log('punto presentacion:', ini === null || ini === void 0 ? void 0 : ini.id_punto);
        const estudios = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: ini === null || ini === void 0 ? void 0 : ini.id_punto } });
        console.log('edges desde presentacion:', estudios.map((e) => ({ status: e.status, type: e.type, destino: e.punto_destino_id })));
        for (const e of estudios) {
            const siguientes = yield iniciativas_estudio_1.default.findAll({ where: { punto_origen_id: e.punto_destino_id } });
            console.log('  edges desde', e.punto_destino_id, ':', siguientes.map((s) => ({ status: s.status, type: s.type, destino: s.punto_destino_id })));
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
