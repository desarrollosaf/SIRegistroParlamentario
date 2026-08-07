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
 * Puebla `inciativas_puntos_ordens.materia` para las iniciativas sembradas
 * desde el Excel (folio_historico no nulo), usando la columna "Materia
 * (referencia)" del propio Excel — no existe en el backup (esa tabla nunca
 * tuvo este campo), así que el Excel es la única fuente para esto.
 *
 * Solo toca la columna `materia`, nada más.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-materia.ts --commit
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const sync_1 = require("csv-parse/sync");
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const CSV_PATH = path_1.default.resolve(__dirname, '../../data/historico-iniciativas.csv');
function limpiarTexto(valor) {
    if (!valor)
        return null;
    return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        const filas = (0, sync_1.parse)(fs_1.default.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
        const materiaPorFolio = new Map();
        for (const f of filas) {
            if (!materiaPorFolio.has(Number(f.folio)) && f.materia) {
                materiaPorFolio.set(Number(f.folio), f.materia);
            }
        }
        const sembradas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        console.log(`Iniciativas del Excel a revisar: ${sembradas.length}`);
        let actualizadas = 0;
        let sinMateria = 0;
        for (const ini of sembradas) {
            const materia = materiaPorFolio.get(ini.folio_historico);
            if (!materia) {
                sinMateria++;
                continue;
            }
            if (commit) {
                yield ini.update({ materia: limpiarTexto(materia) });
            }
            actualizadas++;
        }
        console.log(`Actualizadas: ${actualizadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
        console.log(`Sin materia en el Excel: ${sinMateria}`);
        if (!commit)
            console.log('Corre con --commit para escribir de verdad.');
    });
}
main().then(() => process.exit(0)).catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
