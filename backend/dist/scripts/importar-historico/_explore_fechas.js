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
        const [rows] = yield registrocomisiones_1.default.query(`
    SELECT MIN(fecha) minf, MAX(fecha) maxf, COUNT(*) c
    FROM agendas
    WHERE descripcion IS NULL OR descripcion <> 'Importación histórica LXII Legislatura'
  `);
        console.log('Rango fechas agendas REALES (no mías):', rows);
        const [porAnio] = yield registrocomisiones_1.default.query(`
    SELECT YEAR(fecha) anio, COUNT(*) c
    FROM agendas
    WHERE descripcion IS NULL OR descripcion <> 'Importación histórica LXII Legislatura'
    GROUP BY YEAR(fecha)
    ORDER BY anio
  `);
        console.log('Agendas reales por año:', porAnio);
        const [tipoEventos] = yield registrocomisiones_1.default.query(`SELECT id, nombre FROM tipo_eventos`);
        console.log('\ntipo_eventos:', tipoEventos);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
