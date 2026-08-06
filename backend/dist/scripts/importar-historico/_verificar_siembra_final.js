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
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const agendas_1 = __importDefault(require("../../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const conTag = yield inciativas_puntos_ordens_1.default.count({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        console.log('Total inciativas_puntos_ordens con folio_historico:', conTag);
        console.log('agendas totales (debe seguir en 506):', yield agendas_1.default.count());
        console.log('puntos_ordens totales (debe seguir en 2688 + 6 si alguno era nuevo... no, no cree puntos):', yield puntos_ordens_1.default.count());
        const nuevas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } }, order: [['createdAt', 'DESC']], limit: 6 });
        console.log('\nÚltimas creadas (las 6 nuevas deberían verse aquí):');
        nuevas.forEach((n) => { var _a; return console.log(' -', n.folio_historico, n.id_punto, (_a = n.iniciativa) === null || _a === void 0 ? void 0 : _a.slice(0, 60)); });
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
