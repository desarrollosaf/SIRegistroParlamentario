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
        const restantes = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        console.log('inciativas_puntos_ordens restantes con folio_historico:', restantes.length);
        if (restantes.length) {
            const r = restantes[0];
            console.log('ejemplo:', r.folio_historico, r.id_punto, r.id_evento);
            const agenda = yield agendas_1.default.findByPk(r.id_evento);
            console.log('agenda existe?', !!agenda, agenda === null || agenda === void 0 ? void 0 : agenda.get());
            const punto = yield puntos_ordens_1.default.findByPk(r.id_punto);
            console.log('punto existe?', !!punto);
        }
        console.log('total agendas ahora:', yield agendas_1.default.count());
        console.log('total puntos_ordens ahora:', yield puntos_ordens_1.default.count());
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
