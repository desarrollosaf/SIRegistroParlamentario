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
/**
 * Aplica add-nombre-captura-to-diputados usando la conexión legislativoConnection
 * (diputados vive en adminplem_congresoedomex, no en la BD de registrocomisiones).
 * Seguro de correr más de una vez: se salta si la columna ya existe.
 *
 * Uso: ts-node src/scripts/capturadora/0-aplicar-migracion.ts
 */
const legislativoConnection_1 = __importDefault(require("../../database/legislativoConnection"));
const migracion = require('../../migrations/20260807120000-add-nombre-captura-to-diputados.js');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const qi = legislativoConnection_1.default.getQueryInterface();
        const tabla = yield qi.describeTable('diputados');
        if (tabla['nombre_captura']) {
            console.log('La columna nombre_captura ya existe. Nada que hacer.');
            process.exit(0);
        }
        console.log('Aplicando migración...');
        yield migracion.up(qi, legislativoConnection_1.default.constructor);
        console.log('✔ Columna nombre_captura creada en diputados.');
        process.exit(0);
    });
}
main().catch((err) => {
    console.error('✖ Error aplicando migración:', err);
    process.exit(1);
});
