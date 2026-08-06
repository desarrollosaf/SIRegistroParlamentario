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
 * Borra (hard delete) lo sembrado por importar.ts EXCEPTO agendas y
 * puntos_ordens (el usuario confirmó que esos están correctos). Usa el mapeo
 * exportado por exportar-mapeo.ts para saber exactamente qué puntos_ordens
 * pertenecen a la siembra histórica, sin tocar nada más.
 *
 * NO toca la tabla `expedientes` / `expedientes_estudio_puntos`: verificado
 * que ninguno de sus 69/277 registros fue creado por la siembra histórica
 * (el más reciente es de mayo 2026, antes de esta importación).
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const MAPEO_PATH = path_1.default.resolve(__dirname, '../../data/mapeo-puntos-historico.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(MAPEO_PATH)) {
            throw new Error(`No existe ${MAPEO_PATH}. Corre primero exportar-mapeo.ts (con los datos aún sin borrar).`);
        }
        const mapeo = JSON.parse(fs_1.default.readFileSync(MAPEO_PATH, 'utf8'));
        const todosLosPuntoIds = new Set();
        for (const f of mapeo) {
            todosLosPuntoIds.add(Number(f.puntoPresentacionId));
            for (const p of f.pasos)
                todosLosPuntoIds.add(Number(p.puntoId));
        }
        const puntoIdsArray = [...todosLosPuntoIds];
        console.log(`puntos_ordens involucrados (NO se borran, solo se usan para acotar el borrado): ${puntoIdsArray.length}`);
        const inis = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        const iniciativaIds = inis.map((i) => i.id);
        console.log(`inciativas_puntos_ordens a borrar: ${iniciativaIds.length}`);
        const bComisiones = yield puntos_comisiones_1.default.destroy({ where: { id_punto: { [sequelize_1.Op.in]: puntoIdsArray } } });
        console.log(`puntos_comisiones borradas: ${bComisiones}`);
        const bEstudios = yield iniciativas_estudio_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { punto_origen_id: { [sequelize_1.Op.in]: puntoIdsArray } },
                    { punto_destino_id: { [sequelize_1.Op.in]: puntoIdsArray } },
                ],
            },
            force: true,
        });
        console.log(`iniciativas_estudios borradas: ${bEstudios}`);
        const bPresenta = yield iniciativaspresenta_1.default.destroy({
            where: { id_iniciativa: { [sequelize_1.Op.in]: iniciativaIds } },
            force: true,
        });
        console.log(`iniciativas_presenta borradas: ${bPresenta}`);
        const bIniciativas = yield inciativas_puntos_ordens_1.default.destroy({
            where: { folio_historico: { [sequelize_1.Op.ne]: null } },
            force: true,
        });
        console.log(`inciativas_puntos_ordens borradas: ${bIniciativas}`);
        console.log('\n✔ Limpieza terminada. agendas y puntos_ordens NO se tocaron.');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error borrando:', err);
    process.exit(1);
});
