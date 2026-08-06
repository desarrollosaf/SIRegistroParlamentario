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
const expediente_1 = __importDefault(require("../../models/expediente"));
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Una agenda REAL (no mía) de tipo Comisión con varios puntos, para ver textos
        const realAgenda = yield agendas_1.default.findOne({
            where: { descripcion: { [sequelize_1.Op.or]: [{ [sequelize_1.Op.ne]: 'Importación histórica LXII Legislatura' }, { [sequelize_1.Op.is]: null }] } },
            order: [['fecha', 'DESC']],
        });
        console.log('Agenda real ejemplo:', realAgenda === null || realAgenda === void 0 ? void 0 : realAgenda.get());
        const puntos = yield puntos_ordens_1.default.findAll({ where: { id_evento: realAgenda === null || realAgenda === void 0 ? void 0 : realAgenda.id }, limit: 10 });
        console.log('\nPuntos de esa agenda:');
        puntos.forEach((p) => console.log(' -', p.id, '|', (p.punto || '').slice(0, 100)));
        // Expediente real de ejemplo con sus puntos de estudio
        const exp = yield expediente_1.default.findOne({ order: [['id', 'DESC']] });
        console.log('\nExpediente real ejemplo:', exp === null || exp === void 0 ? void 0 : exp.get());
        const puntosExp = yield expedientes_estudio_puntos_1.default.findAll({ where: { expediente_id: exp === null || exp === void 0 ? void 0 : exp.id } });
        console.log('expedientes_estudio_puntos de ese expediente:', puntosExp.map((p) => p.get()));
        // iniciativas_estudio type=2 (bundling) ejemplo
        const est2 = yield iniciativas_estudio_1.default.findOne({ where: { type: '2' }, order: [['createdAt', 'DESC']] });
        console.log('\niniciativas_estudio type=2 ejemplo:', est2 === null || est2 === void 0 ? void 0 : est2.get());
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
