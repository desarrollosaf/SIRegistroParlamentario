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
const agendas_1 = __importDefault(require("../../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const expediente_1 = __importDefault(require("../../models/expediente"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('agendas:', yield agendas_1.default.count(), '(debe seguir 506)');
        console.log('puntos_ordens:', yield puntos_ordens_1.default.count(), '(debe seguir 2688)');
        console.log('inciativas_puntos_ordens con folio_historico:', yield inciativas_puntos_ordens_1.default.count({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } }));
        console.log('expedientes totales:', yield expediente_1.default.count(), '(reales preexistentes + los reconstruidos)');
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
