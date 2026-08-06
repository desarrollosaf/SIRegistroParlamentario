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
    SELECT folio_historico, COUNT(*) c, GROUP_CONCAT(id_punto) puntos
    FROM inciativas_puntos_ordens
    WHERE folio_historico IS NOT NULL
    GROUP BY folio_historico
    HAVING c > 1
  `);
        console.log('Folios con MAS de un registro (posible duplicado por re-match):', rows.length);
        console.log(rows);
        process.exit(0);
    });
}
main().catch((e) => { console.error(e); process.exit(1); });
