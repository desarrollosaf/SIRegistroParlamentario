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
const sequelize_1 = require("sequelize");
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('iniciativas_estudios borradas:', yield iniciativas_estudio_1.default.destroy({ where: {}, force: true }));
        const inis = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        const puntoIds = inis.map((i) => i.id_punto);
        const [afectados] = yield puntos_ordens_1.default.update({ id_dictamen: null }, { where: { id: { [sequelize_1.Op.in]: puntoIds } } });
        console.log('id_dictamen reseteado en puntos:', afectados);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
