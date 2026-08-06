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
 * Limpieza final: usa el mapeo exportado ANTES de cualquier borrado
 * (mapeo-puntos-historico.json, 1228 folios) como lista definitiva de qué
 * puntos_ordens son míos, sin importar si terminaron colgados de una agenda
 * real (caso de los 105 folios que reusaron por accidente una agenda real de
 * tipo "Diputación permanente" por el bug del UUID). Solo borra esos puntos
 * puntuales, nunca la agenda que los contiene si esa agenda es real.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const MAPEO_PATH = path_1.default.resolve(__dirname, '../../data/mapeo-puntos-historico.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const mapeo = JSON.parse(fs_1.default.readFileSync(MAPEO_PATH, 'utf8'));
        const misPuntos = new Set();
        for (const f of mapeo) {
            misPuntos.add(Number(f.puntoPresentacionId));
            for (const p of f.pasos)
                misPuntos.add(Number(p.puntoId));
        }
        const puntoIdsArray = [...misPuntos];
        console.log(`Puntos míos según mapeo original: ${puntoIdsArray.length}`);
        const existentes = yield puntos_ordens_1.default.findAll({ where: { id: { [sequelize_1.Op.in]: puntoIdsArray } }, attributes: ['id'] });
        console.log(`De esos, siguen existiendo: ${existentes.length}`);
        const bEstudios = yield iniciativas_estudio_1.default.destroy({
            where: { [sequelize_1.Op.or]: [{ punto_origen_id: { [sequelize_1.Op.in]: puntoIdsArray } }, { punto_destino_id: { [sequelize_1.Op.in]: puntoIdsArray } }] },
            force: true,
        });
        console.log(`iniciativas_estudios borradas: ${bEstudios}`);
        const bComisiones = yield puntos_comisiones_1.default.destroy({ where: { id_punto: { [sequelize_1.Op.in]: puntoIdsArray } } });
        console.log(`puntos_comisiones borradas: ${bComisiones}`);
        const inis = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        const iniciativaIds = inis.map((i) => i.id);
        const bPresenta = yield iniciativaspresenta_1.default.destroy({ where: { id_iniciativa: { [sequelize_1.Op.in]: iniciativaIds } }, force: true });
        console.log(`iniciativas_presenta borradas: ${bPresenta}`);
        const bIniciativas = yield inciativas_puntos_ordens_1.default.destroy({ where: { folio_historico: { [sequelize_1.Op.ne]: null } }, force: true });
        console.log(`inciativas_puntos_ordens borradas: ${bIniciativas}`);
        const bPuntos = yield puntos_ordens_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: puntoIdsArray } }, force: true });
        console.log(`puntos_ordens borrados: ${bPuntos}`);
        console.log('\n✔ Limpieza final completa. No se borró ninguna agenda en este paso (las reales se dejaron intactas).');
    });
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
