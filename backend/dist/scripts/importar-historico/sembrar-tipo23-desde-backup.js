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
const registrocomisiones_1 = __importDefault(require("../../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("../../models/puntos_ordens"));
const inciativas_puntos_ordens_1 = __importDefault(require("../../models/inciativas_puntos_ordens"));
const iniciativaspresenta_1 = __importDefault(require("../../models/iniciativaspresenta"));
const puntos_comisiones_1 = __importDefault(require("../../models/puntos_comisiones"));
const leer_backup_sql_1 = require("./leer-backup-sql");
const DUMP = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';
const COL_INI = ['id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion', 'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_PRESENTA = ['id', 'id_iniciativa', 'id_tipo_presenta', 'id_presenta', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_COMISIONES = ['id', 'id_punto', 'id_comision', 'createdAt', 'updatedAt', 'id_punto_turno'];
function limpiarTexto(valor) {
    if (!valor)
        return null;
    return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commit = process.argv.includes('--commit');
        const inisBackup = (0, leer_backup_sql_1.leerTablaDeDump)(DUMP, 'inciativas_puntos_ordens', COL_INI);
        const presentaBackup = (0, leer_backup_sql_1.leerTablaDeDump)(DUMP, 'iniciativas_presenta', COL_PRESENTA);
        const comisionesBackup = (0, leer_backup_sql_1.leerTablaDeDump)(DUMP, 'puntos_comisiones', COL_COMISIONES);
        const tipo23 = inisBackup.filter((r) => r.tipo === '2' || r.tipo === '3');
        console.log(`Registros tipo 2+3 en backup: ${tipo23.length}`);
        const presentaPorIni = new Map();
        for (const p of presentaBackup) {
            if (!p.id_iniciativa)
                continue;
            if (!presentaPorIni.has(p.id_iniciativa))
                presentaPorIni.set(p.id_iniciativa, []);
            presentaPorIni.get(p.id_iniciativa).push(p);
        }
        const comisionesPorPunto = new Map();
        for (const c of comisionesBackup) {
            if (!c.id_punto)
                continue;
            if (!comisionesPorPunto.has(c.id_punto))
                comisionesPorPunto.set(c.id_punto, []);
            comisionesPorPunto.get(c.id_punto).push(c);
        }
        let creadas = 0;
        let sinReferencia = 0;
        let puntoMuerto = 0;
        let yaExistia = 0;
        let errores = 0;
        for (const r of tipo23) {
            if (!r.id_punto || r.id_punto === '0') {
                sinReferencia++;
                continue;
            }
            const puntoVivo = yield puntos_ordens_1.default.findByPk(Number(r.id_punto));
            if (!puntoVivo) {
                puntoMuerto++;
                continue;
            }
            const existente = yield inciativas_puntos_ordens_1.default.findOne({ where: { id_punto: Number(r.id_punto) } });
            if (existente) {
                yaExistia++;
                continue;
            }
            if (!commit) {
                creadas++;
                continue;
            }
            try {
                yield registrocomisiones_1.default.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    const nueva = yield inciativas_puntos_ordens_1.default.create({
                        id_punto: Number(r.id_punto),
                        id_evento: puntoVivo.id_evento,
                        iniciativa: limpiarTexto(r.iniciativa),
                        tipo: Number(r.tipo),
                        path_doc: r.path_doc,
                        precluida: r.precluida ? Number(r.precluida) : null,
                        publico: 0,
                    }, { transaction: t });
                    const presentantes = presentaPorIni.get(r.id) || [];
                    for (const p of presentantes) {
                        yield iniciativaspresenta_1.default.create({
                            id_iniciativa: nueva.id,
                            id_tipo_presenta: p.id_tipo_presenta ? Number(p.id_tipo_presenta) : null,
                            id_presenta: p.id_presenta,
                        }, { transaction: t });
                    }
                    const comisiones = comisionesPorPunto.get(r.id_punto) || [];
                    for (const c of comisiones) {
                        yield puntos_comisiones_1.default.create({ id_punto: Number(r.id_punto), id_comision: c.id_comision }, { transaction: t });
                    }
                    if (comisiones.length > 0) {
                        yield puntos_ordens_1.default.update({ se_turna_comision: 1 }, { where: { id: Number(r.id_punto) }, transaction: t });
                    }
                }));
                creadas++;
            }
            catch (err) {
                errores++;
                console.error(`✖ id backup ${r.id} (punto ${r.id_punto}): ${err.message}`);
            }
        }
        console.log('\n══════════ RESUMEN ══════════');
        console.log(`Creadas: ${creadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
        console.log(`Sin referencia real (id_punto=0): ${sinReferencia}`);
        console.log(`Punto ya no existe: ${puntoMuerto}`);
        console.log(`Ya existían: ${yaExistia}`);
        console.log(`Errores: ${errores}`);
        console.log('═══════════════════════════════\n');
        if (!commit)
            console.log('Corre con --commit para escribir de verdad.');
    });
}
main().then(() => process.exit(0)).catch((err) => {
    console.error('✖ Error fatal:', err);
    process.exit(1);
});
