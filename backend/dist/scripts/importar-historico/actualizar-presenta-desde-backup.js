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
 * Reemplaza `iniciativas_presenta` (quién presenta cada iniciativa) en los
 * inciativas_puntos_ordens YA sembrados, usando el backup — mismo mecanismo
 * que actualizar-tipo-pathdoc-desde-backup.ts: `id_sap` del backup = folio
 * del Excel, llave exacta, sin adivinar por texto.
 *
 * A diferencia de tipo/path_doc (un solo valor por fila), aquí puede haber
 * VARIOS presentantes por iniciativa (coautores) — 126 casos detectados. Por
 * eso esto no es un UPDATE de un campo: se borran las filas actuales de
 * iniciativas_presenta de esa iniciativa y se insertan las reales del backup
 * completas (id_tipo_presenta + id_presenta, que suele ser un UUID real de
 * diputado/proponente, no el texto libre que yo había guardado).
 *
 * No toca inciativas_puntos_ordens, iniciativas_estudios, expedientes ni
 * puntos_comisiones — solo iniciativas_presenta.
 *
 * Uso: ts-node src/scripts/importar-historico/actualizar-presenta-desde-backup.ts --commit [ruta-al-dump]
 */
const sequelize_1 = require("sequelize");
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const leer_backup_sql_1 = require("./leer-backup-sql");
const DUMP_DEFAULT = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';
const COL_INI = [
    'id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion',
    'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap',
    'createdAt', 'updatedAt', 'deletedAt',
];
const COL_PRESENTA = ['id', 'id_iniciativa', 'id_tipo_presenta', 'id_presenta', 'createdAt', 'updatedAt', 'deletedAt'];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        const rutaDump = process.argv.find((a) => a.endsWith('.sql')) || DUMP_DEFAULT;
        console.log(`Leyendo backup: ${rutaDump}`);
        const inisBackup = (0, leer_backup_sql_1.leerTablaDeDump)(rutaDump, 'inciativas_puntos_ordens', COL_INI);
        const presentaBackup = (0, leer_backup_sql_1.leerTablaDeDump)(rutaDump, 'iniciativas_presenta', COL_PRESENTA);
        const iniPorSap = new Map(); // folio -> backup ini.id
        for (const i of inisBackup)
            if (i.id_sap && i.id)
                iniPorSap.set(Number(i.id_sap), i.id);
        const presentaPorIniBackup = new Map();
        for (const p of presentaBackup) {
            if (!p.id_iniciativa)
                continue;
            if (!presentaPorIniBackup.has(p.id_iniciativa))
                presentaPorIniBackup.set(p.id_iniciativa, []);
            presentaPorIniBackup.get(p.id_iniciativa).push(p);
        }
        const sembradas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        console.log(`Iniciativas ya sembradas a revisar: ${sembradas.length}`);
        let actualizadas = 0;
        let sinDatoEnBackup = 0;
        let filasNuevas = 0;
        for (const ini of sembradas) {
            const folio = ini.folio_historico;
            const backupIniId = iniPorSap.get(folio);
            if (!backupIniId) {
                sinDatoEnBackup++;
                continue;
            }
            const presentantesReales = presentaPorIniBackup.get(backupIniId);
            if (!presentantesReales || presentantesReales.length === 0) {
                sinDatoEnBackup++;
                continue;
            }
            if (commit) {
                yield iniciativaspresenta_1.default.destroy({ where: { id_iniciativa: ini.id }, force: true });
                for (const p of presentantesReales) {
                    yield iniciativaspresenta_1.default.create({
                        id_iniciativa: ini.id,
                        id_tipo_presenta: p.id_tipo_presenta ? Number(p.id_tipo_presenta) : null,
                        id_presenta: p.id_presenta,
                    });
                }
            }
            actualizadas++;
            filasNuevas += presentantesReales.length;
        }
        console.log('\n══════════ RESUMEN ══════════');
        console.log(`Iniciativas actualizadas: ${actualizadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
        console.log(`Filas de presentantes reales insertadas: ${filasNuevas}`);
        console.log(`Sin dato en backup para su folio: ${sinDatoEnBackup}`);
        console.log('═══════════════════════════════\n');
        if (!commit)
            console.log('Corre con --commit para escribir de verdad.');
    });
}
main().then(() => process.exit(0)).catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
