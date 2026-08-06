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
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const [desc] = yield registrocomisiones_1.default.query(`DESCRIBE agendas`);
        console.log('columna fecha:', desc.find((d) => d.Field === 'fecha'));
        const [directo] = yield registrocomisiones_1.default.query(`
    SELECT id, fecha, DATE(fecha) as solo_fecha
    FROM agendas WHERE id='d90cf967-21f5-4775-a550-f4d568f999b3'
  `);
        console.log('agenda directa via raw SQL:', directo);
        const [porDateFn] = yield registrocomisiones_1.default.query(`
    SELECT id FROM agendas WHERE DATE(fecha) = '2026-04-08' AND tipo_evento_id='0e772516-bbc2-402f-afa0-022489752d33'
  `);
        console.log('agendas via DATE(fecha)=... :', porDateFn);
        const [rows] = yield registrocomisiones_1.default.query(`
    SELECT TIME(fecha) hora, COUNT(*) c
    FROM agendas
    GROUP BY TIME(fecha)
    ORDER BY c DESC
    LIMIT 20
  `);
        console.log('Distribución de horas en agendas.fecha:', rows);
        const [medianoche] = yield registrocomisiones_1.default.query(`SELECT COUNT(*) c FROM agendas WHERE TIME(fecha) = '00:00:00'`);
        const [total] = yield registrocomisiones_1.default.query(`SELECT COUNT(*) c FROM agendas`);
        console.log('A medianoche exacta:', medianoche[0].c, '/', total[0].c);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
