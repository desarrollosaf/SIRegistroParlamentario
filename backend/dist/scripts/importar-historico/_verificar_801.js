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
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const agendas_1 = __importDefault(require("../../models/agendas"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const ini = yield inciativas_puntos_ordens_1.default.findOne({ where: { folio_historico: 801 } });
        console.log('iniciativa:', ini === null || ini === void 0 ? void 0 : ini.get());
        let origen = ini === null || ini === void 0 ? void 0 : ini.id_punto;
        for (let i = 0; i < 5; i++) {
            const est = yield iniciativas_estudio_1.default.findOne({ where: { punto_origen_id: origen } });
            if (!est)
                break;
            const punto = yield puntos_ordens_1.default.findByPk(est.punto_destino_id);
            const agenda = yield agendas_1.default.findByPk(punto.id_evento);
            console.log(' ->', est.status, agenda === null || agenda === void 0 ? void 0 : agenda.fecha, (_a = punto === null || punto === void 0 ? void 0 : punto.punto) === null || _a === void 0 ? void 0 : _a.slice(0, 80));
            origen = est.punto_destino_id;
        }
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
