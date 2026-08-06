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
const sequelize_1 = require("sequelize");
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const leer_backup_sql_1 = require("./leer-backup-sql");
const DUMP_DEFAULT = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';
// Orden de columnas confirmado contra el CREATE TABLE del dump.
const COLUMNAS = [
    'id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion',
    'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap',
    'createdAt', 'updatedAt', 'deletedAt',
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        const rutaDump = process.argv.find((a) => a.endsWith('.sql')) || DUMP_DEFAULT;
        console.log(`Leyendo backup: ${rutaDump}`);
        const filasBackup = (0, leer_backup_sql_1.leerTablaDeDump)(rutaDump, 'inciativas_puntos_ordens', COLUMNAS);
        console.log(`Filas totales en backup: ${filasBackup.length}`);
        const conSap = filasBackup.filter((f) => f.id_sap);
        console.log(`Filas con id_sap (=folio): ${conSap.length}`);
        const porFolio = new Map();
        for (const f of conSap)
            porFolio.set(Number(f.id_sap), f);
        const sembradas = yield inciativas_puntos_ordens_1.default.findAll({ where: { folio_historico: { [sequelize_1.Op.ne]: null } } });
        console.log(`Iniciativas ya sembradas a revisar: ${sembradas.length}`);
        let actualizadas = 0;
        let sinDatoEnBackup = 0;
        let sinCambio = 0;
        for (const ini of sembradas) {
            const folio = ini.folio_historico;
            const filaBackup = porFolio.get(folio);
            if (!filaBackup) {
                sinDatoEnBackup++;
                continue;
            }
            const tipoNuevo = filaBackup.tipo !== null ? Number(filaBackup.tipo) : null;
            const pathNuevo = filaBackup.path_doc;
            if (tipoNuevo === ini.tipo && pathNuevo === ini.path_doc) {
                sinCambio++;
                continue;
            }
            if (commit) {
                yield ini.update({ tipo: tipoNuevo, path_doc: pathNuevo });
            }
            actualizadas++;
        }
        console.log('\n══════════ RESUMEN ══════════');
        console.log(`Actualizadas (tipo/path_doc): ${actualizadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
        console.log(`Sin dato en backup para su folio: ${sinDatoEnBackup}`);
        console.log(`Sin cambios (ya coincidía): ${sinCambio}`);
        console.log('═══════════════════════════════\n');
        if (!commit)
            console.log('Corre con --commit para escribir de verdad.');
    });
}
main().then(() => process.exit(0)).catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
});
