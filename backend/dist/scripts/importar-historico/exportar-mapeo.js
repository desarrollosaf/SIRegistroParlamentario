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
 * Exporta, ANTES de borrar nada, el mapeo folio_historico -> puntos_ordens ya
 * creados (presentación + cadena de estudio/dictamen), leyendo el estado
 * actual de la BD. Se usa para poder borrar inciativas_puntos_ordens /
 * iniciativas_estudios / iniciativas_presenta / puntos_comisiones y volver a
 * sembrarlos apuntando A LOS MISMOS agendas/puntos_ordens que ya existen
 * (que el usuario confirmó que están correctos), sin duplicarlos.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativas_estudio_1 = __importDefault(require("../../models/iniciativas_estudio"));
const DESTINO = path_1.default.resolve(__dirname, '../../data/mapeo-puntos-historico.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const inis = yield inciativas_puntos_ordens_1.default.findAll({
            where: { folio_historico: { [require('sequelize').Op.ne]: null } },
        });
        console.log(`Iniciativas históricas encontradas: ${inis.length}`);
        const mapeo = [];
        for (const ini of inis) {
            const puntoPresentacionId = ini.id_punto;
            const sesionAgendaId = ini.id_evento;
            const pasos = [];
            let puntoActual = puntoPresentacionId;
            const visitados = new Set();
            for (let i = 0; i < 20; i++) {
                const estudio = yield iniciativas_estudio_1.default.findOne({ where: { punto_origen_id: puntoActual } });
                if (!estudio)
                    break;
                const destino = estudio.punto_destino_id;
                const esCierre = destino === puntoActual;
                pasos.push({ puntoId: destino, status: String(estudio.status), esCierre });
                if (esCierre || visitados.has(destino))
                    break;
                visitados.add(destino);
                puntoActual = destino;
            }
            mapeo.push({
                folio: ini.folio_historico,
                puntoPresentacionId,
                sesionAgendaId,
                pasos,
            });
        }
        fs_1.default.writeFileSync(DESTINO, JSON.stringify(mapeo, null, 2), 'utf8');
        console.log(`✔ Mapeo exportado: ${DESTINO}`);
        console.log(`  Folios mapeados: ${mapeo.length}`);
    });
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('✖ Error exportando mapeo:', err);
    process.exit(1);
});
