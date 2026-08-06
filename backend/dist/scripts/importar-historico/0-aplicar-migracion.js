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
 * Aplica las migraciones del import histórico usando la MISMA conexión que
 * usa la app en runtime (database/registrocomisiones.ts).
 *
 * OJO: `npx sequelize-cli db:migrate` NO sirve en este proyecto — su
 * src/config/config.json apunta a una base "registrocomisiones" que no es
 * ninguna de las bases reales (adminplem_siregistroparlamentario /
 * adminplem_congresoedomex). Por eso este runner manual.
 *
 * Seguro de correr varias veces: cada migración se salta si su columna ya existe.
 *
 * Uso: ts-node src/scripts/importar-historico/0-aplicar-migracion.ts
 */
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const MIGRACIONES = [
    { archivo: '20260804120000-add-folio-historico-to-iniciativas-puntos-ordens.js', columna: 'folio_historico' },
    { archivo: '20260805200000-add-folios-agrupados-to-iniciativas-puntos-ordens.js', columna: 'folios_agrupados' },
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const qi = registrocomisiones_1.default.getQueryInterface();
        const tabla = yield qi.describeTable('inciativas_puntos_ordens');
        for (const m of MIGRACIONES) {
            if (tabla[m.columna]) {
                console.log(`La columna ${m.columna} ya existe. Se salta.`);
                continue;
            }
            const migracion = require(`../../migrations/${m.archivo}`);
            console.log(`Aplicando ${m.archivo}...`);
            yield migracion.up(qi, registrocomisiones_1.default.constructor);
            console.log(`✔ Columna ${m.columna} creada.`);
        }
        process.exit(0);
    });
}
main().catch((err) => {
    console.error('✖ Error aplicando migración:', err);
    process.exit(1);
});
