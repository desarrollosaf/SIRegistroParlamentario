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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const totalAgendas = yield agendas_1.default.count();
        const mias = yield agendas_1.default.count({ where: { descripcion: 'Importación histórica LXII Legislatura' } });
        console.log('Total agendas:', totalAgendas, '| mías (import histórico):', mias, '| reales previas:', totalAgendas - mias);
        const misAgendas = yield agendas_1.default.findAll({ where: { descripcion: 'Importación histórica LXII Legislatura' }, attributes: ['id'] });
        const misIds = misAgendas.map((a) => a.id);
        const misPuntos = yield puntos_ordens_1.default.count({ where: { id_evento: { [sequelize_1.Op.in]: misIds } } });
        console.log('puntos_ordens dentro de mis agendas:', misPuntos);
        const totalPuntos = yield puntos_ordens_1.default.count();
        console.log('Total puntos_ordens:', totalPuntos, '| reales previos (no en mis agendas):', totalPuntos - misPuntos);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
