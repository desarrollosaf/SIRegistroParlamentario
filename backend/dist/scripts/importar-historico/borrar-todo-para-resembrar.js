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
 * Borra TODO el contenido de las tablas operativas de iniciativas (a pedido
 * explícito del usuario, que confirmó tener respaldo). Deja intactos
 * `agendas` y `puntos_ordens` (los eventos y el orden del día real).
 *
 * Orden de borrado por dependencias:
 *   iniciativas_estudios, expedientes_estudio_puntos, expedientes,
 *   puntos_comisiones, iniciativas_presenta, inciativas_puntos_ordens
 */
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const expedientes_estudio_puntos_1 = __importDefault(require("../../models/expedientes_estudio_puntos"));
const expediente_1 = __importDefault(require("../../models/expediente"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`iniciativas_estudios: ${yield iniciativas_estudio_1.default.destroy({ where: {}, force: true })}`);
        console.log(`expedientes_estudio_puntos: ${yield expedientes_estudio_puntos_1.default.destroy({ where: {} })}`);
        console.log(`expedientes: ${yield expediente_1.default.destroy({ where: {} })}`);
        console.log(`puntos_comisiones: ${yield puntos_comisiones_1.default.destroy({ where: {} })}`);
        console.log(`iniciativas_presenta: ${yield iniciativaspresenta_1.default.destroy({ where: {}, force: true })}`);
        console.log(`inciativas_puntos_ordens: ${yield inciativas_puntos_ordens_1.default.destroy({ where: {}, force: true })}`);
        console.log('\n✔ Listo. agendas y puntos_ordens no se tocaron.');
    });
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
