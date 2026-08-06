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
exports.buscarAgendasPorFecha = buscarAgendasPorFecha;
/**
 * `agendas.fecha` es TIMESTAMP real (guarda hora, no solo fecha) — muchas
 * reuniones de comisión tienen hora específica (ej. 21:00 UTC ≈ 3pm local).
 * Comparar con `fecha = 'YYYY-MM-DD'` falla en silencio para esos casos
 * (solo matchea la convención de "medianoche"). Hay que comparar por
 * DATE(fecha), que MySQL evalúa en la zona horaria de la conexión — la
 * misma que usa la app para mostrarle la fecha al usuario.
 */
const sequelize_1 = require("sequelize");
const agendas_1 = __importDefault(require("../../models/agendas"));
function buscarAgendasPorFecha(fechaISO, tipoEventoId) {
    return __awaiter(this, void 0, void 0, function* () {
        return agendas_1.default.findAll({
            where: {
                tipo_evento_id: tipoEventoId,
                [sequelize_1.Op.and]: [(0, sequelize_1.where)((0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha')), fechaISO)],
            },
        });
    });
}
