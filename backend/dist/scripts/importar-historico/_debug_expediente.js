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
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const expediente_1 = __importDefault(require("../../models/expediente"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
function inspect(puntoId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log(`\n=== punto_origen_sesion_id = ${puntoId} ===`);
        const rows = yield expedientes_estudio_puntos_1.default.findAll({ where: { punto_origen_sesion_id: puntoId } });
        console.log(`Filas en expedientes_estudio_puntos: ${rows.length}`);
        for (const r of rows) {
            console.log(' -', r.get());
            const exp = yield expediente_1.default.findByPk(r.expediente_id);
            console.log('   expediente:', exp === null || exp === void 0 ? void 0 : exp.get());
            const otrosPuntosDelExpediente = yield expedientes_estudio_puntos_1.default.findAll({ where: { expediente_id: r.expediente_id } });
            console.log('   otros puntos_origen_sesion en el mismo expediente:', otrosPuntosDelExpediente.map((o) => o.punto_origen_sesion_id));
            const estudio = yield iniciativas_estudio_1.default.findOne({ where: { punto_origen_id: String(r.expediente_id) } });
            console.log('   iniciativas_estudio type=2 para ese expediente:', estudio === null || estudio === void 0 ? void 0 : estudio.get());
        }
        const puntoOrigen = yield puntos_ordens_1.default.findByPk(puntoId);
        console.log('texto del punto origen:', (_a = puntoOrigen === null || puntoOrigen === void 0 ? void 0 : puntoOrigen.punto) === null || _a === void 0 ? void 0 : _a.slice(0, 100));
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield inspect(19);
        yield inspect(28);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
