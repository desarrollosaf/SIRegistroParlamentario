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
 * Borra en cascada TODO lo que creó importar.ts (la versión que inventaba
 * agendas/puntos_ordens nuevos con una sede genérica en vez de usar los
 * eventos reales ya existentes). Identificado exclusivamente por
 * agendas.descripcion = 'Importación histórica LXII Legislatura' (marca que
 * solo usa este script, ningún dato real la tiene).
 *
 * No toca ningún registro real.
 */
const sequelize_1 = require("sequelize");
const agendas_1 = __importDefault(require("../../models/agendas"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const DESCRIPCION_IMPORT = 'Importación histórica LXII Legislatura';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const agendasFalsas = yield agendas_1.default.findAll({ where: { descripcion: DESCRIPCION_IMPORT }, attributes: ['id'] });
        const agendaIds = agendasFalsas.map((a) => a.id);
        console.log(`Agendas falsas encontradas: ${agendaIds.length}`);
        if (agendaIds.length === 0) {
            console.log('Nada que borrar.');
            return;
        }
        const puntosFalsos = yield puntos_ordens_1.default.findAll({ where: { id_evento: { [sequelize_1.Op.in]: agendaIds } }, attributes: ['id'] });
        const puntoIds = puntosFalsos.map((p) => p.id);
        console.log(`puntos_ordens falsos encontrados: ${puntoIds.length}`);
        // 1) iniciativas_estudios que cuelguen de esos puntos (origen o destino)
        const bEstudios = yield iniciativas_estudio_1.default.destroy({
            where: {
                [sequelize_1.Op.or]: [
                    { punto_origen_id: { [sequelize_1.Op.in]: puntoIds } },
                    { punto_destino_id: { [sequelize_1.Op.in]: puntoIds } },
                ],
            },
            force: true,
        });
        console.log(`iniciativas_estudios borradas: ${bEstudios}`);
        // 2) puntos_comisiones de esos puntos
        const bComisiones = yield puntos_comisiones_1.default.destroy({ where: { id_punto: { [sequelize_1.Op.in]: puntoIds } } });
        console.log(`puntos_comisiones borradas: ${bComisiones}`);
        // 3) inciativas_puntos_ordens que apunten a esos puntos (via id_punto o id_evento)
        const inis = yield inciativas_puntos_ordens_1.default.findAll({
            where: { [sequelize_1.Op.or]: [{ id_punto: { [sequelize_1.Op.in]: puntoIds } }, { id_evento: { [sequelize_1.Op.in]: agendaIds } }] },
        });
        const iniciativaIds = inis.map((i) => i.id);
        const bPresenta = yield iniciativaspresenta_1.default.destroy({ where: { id_iniciativa: { [sequelize_1.Op.in]: iniciativaIds } }, force: true });
        console.log(`iniciativas_presenta borradas: ${bPresenta}`);
        const bIniciativas = yield inciativas_puntos_ordens_1.default.destroy({
            where: { id: { [sequelize_1.Op.in]: iniciativaIds } },
            force: true,
        });
        console.log(`inciativas_puntos_ordens borradas: ${bIniciativas}`);
        // 4) puntos_ordens falsos
        const bPuntos = yield puntos_ordens_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: puntoIds } }, force: true });
        console.log(`puntos_ordens borrados: ${bPuntos}`);
        // 5) agendas falsas
        const bAgendas = yield agendas_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: agendaIds } }, force: true });
        console.log(`agendas borradas: ${bAgendas}`);
        console.log('\n✔ Rollback completo. Solo se tocaron registros creados por importar.ts.');
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
