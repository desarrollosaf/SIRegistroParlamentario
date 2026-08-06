/**
 * Actualiza `tipo` y `path_doc` en los inciativas_puntos_ordens YA sembrados
 * (folio_historico no nulo), cruzando contra el backup .sql — donde el campo
 * `id_sap` resultó ser exactamente el número de folio del Excel (verificado
 * a mano: id_sap=1175 y 1257 tienen texto idéntico letra por letra a esos
 * folios, y su id_punto real sigue existiendo en la BD viva).
 *
 * Esto reemplaza cualquier intento de match por texto para este caso
 * puntual: aquí no hace falta adivinar, es una llave exacta.
 *
 * Uso: ts-node src/scripts/importar-historico/actualizar-tipo-pathdoc-desde-backup.ts --commit [ruta-al-dump]
 */
import path from 'path';
import { Op } from 'sequelize';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import { leerTablaDeDump } from './leer-backup-sql';

const DUMP_DEFAULT = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';

// Orden de columnas confirmado contra el CREATE TABLE del dump.
const COLUMNAS = [
  'id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion',
  'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap',
  'createdAt', 'updatedAt', 'deletedAt',
];

async function main() {
  const commit = process.argv.includes('--commit');
  const rutaDump = process.argv.find((a) => a.endsWith('.sql')) || DUMP_DEFAULT;

  console.log(`Leyendo backup: ${rutaDump}`);
  const filasBackup = leerTablaDeDump(rutaDump, 'inciativas_puntos_ordens', COLUMNAS);
  console.log(`Filas totales en backup: ${filasBackup.length}`);

  const conSap = filasBackup.filter((f) => f.id_sap);
  console.log(`Filas con id_sap (=folio): ${conSap.length}`);

  const porFolio = new Map<number, typeof conSap[0]>();
  for (const f of conSap) porFolio.set(Number(f.id_sap), f);

  const sembradas = await IniciativaPuntoOrden.findAll({ where: { folio_historico: { [Op.ne]: null } } as any });
  console.log(`Iniciativas ya sembradas a revisar: ${sembradas.length}`);

  let actualizadas = 0;
  let sinDatoEnBackup = 0;
  let sinCambio = 0;

  for (const ini of sembradas as any[]) {
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
      await ini.update({ tipo: tipoNuevo, path_doc: pathNuevo });
    }
    actualizadas++;
  }

  console.log('\n══════════ RESUMEN ══════════');
  console.log(`Actualizadas (tipo/path_doc): ${actualizadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
  console.log(`Sin dato en backup para su folio: ${sinDatoEnBackup}`);
  console.log(`Sin cambios (ya coincidía): ${sinCambio}`);
  console.log('═══════════════════════════════\n');

  if (!commit) console.log('Corre con --commit para escribir de verdad.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('✖ Error:', err);
  process.exit(1);
});
