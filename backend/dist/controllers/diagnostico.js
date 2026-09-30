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
exports.pingDb = void 0;
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const pleno_1 = __importDefault(require("../database/pleno"));
/**
 * Corre un SELECT 1 dos veces seguidas contra una conexión YA VIVA en este
 * proceso (no una nueva) — si la primera sale mucho más lenta que la
 * segunda (p.ej. 5200ms vs 4ms), el retraso está en obtener/crear la
 * conexión del pool, no en ejecutar la consulta en sí.
 */
function medirDosConsultas(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        const t1 = Date.now();
        try {
            yield sequelize.query('SELECT 1');
        }
        catch (error) {
            return { primera_ms: Date.now() - t1, error: error.message };
        }
        const primera_ms = Date.now() - t1;
        const t2 = Date.now();
        try {
            yield sequelize.query('SELECT 1');
        }
        catch (error) {
            return { primera_ms, segunda_ms: Date.now() - t2, error: error.message };
        }
        return { primera_ms, segunda_ms: Date.now() - t2 };
    });
}
/**
 * Diagnóstico temporal para la lentitud intermitente reportada en
 * detalle-comisión (ver conversación/commits alrededor de esta fecha).
 * Pégale a este endpoint justo cuando notes la lentitud (o después de dejar
 * el sistema inactivo un rato) para ver en qué conexión está el retraso y
 * si es la conexión o la consulta. Quitar una vez resuelto el diagnóstico.
 */
const pingDb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [legislativo, registrocomisionesRes, plenoRes] = yield Promise.all([
        medirDosConsultas(legislativoConnection_1.default),
        medirDosConsultas(registrocomisiones_1.default),
        medirDosConsultas(pleno_1.default),
    ]);
    return res.json({
        legislativo,
        registrocomisiones: registrocomisionesRes,
        pleno: plenoRes,
    });
});
exports.pingDb = pingDb;
