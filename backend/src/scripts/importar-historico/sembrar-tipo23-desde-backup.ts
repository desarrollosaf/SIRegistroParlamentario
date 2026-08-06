/**
 * Siembra los registros tipo 2 (Minutas) y tipo 3 (Puntos de Acuerdo) del
 * backup — NO vienen en la Matriz_simple (el Excel solo cubre iniciativas,
 * tipo 1), así que no hay folio con qué cruzarlos. Se siembran directo del
 * backup, verificando que su `id_punto` real siga vivo en la BD.
 *
 * No se les asigna folio_historico (no aplica, no vienen del Excel). Se
 * saltan los que tienen id_punto = '0' (sin referencia real en el backup) o
 * cuyo punto ya no existe.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-tipo23-desde-backup.ts --commit
 */
import { Op } from 'sequelize';
import sequelize from '../../database/registrocomisiones';
import PuntosOrden from '../../models/puntos_ordens';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';
import { leerTablaDeDump } from './leer-backup-sql';

const DUMP = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';
const COL_INI = ['id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion', 'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_PRESENTA = ['id', 'id_iniciativa', 'id_tipo_presenta', 'id_presenta', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_COMISIONES = ['id', 'id_punto', 'id_comision', 'createdAt', 'updatedAt', 'id_punto_turno'];

function limpiarTexto(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}

async function main() {
  const commit = process.argv.includes('--commit');

  const inisBackup = leerTablaDeDump(DUMP, 'inciativas_puntos_ordens', COL_INI);
  const presentaBackup = leerTablaDeDump(DUMP, 'iniciativas_presenta', COL_PRESENTA);
  const comisionesBackup = leerTablaDeDump(DUMP, 'puntos_comisiones', COL_COMISIONES);

  const tipo23 = inisBackup.filter((r) => r.tipo === '2' || r.tipo === '3');
  console.log(`Registros tipo 2+3 en backup: ${tipo23.length}`);

  const presentaPorIni = new Map<string, typeof presentaBackup>();
  for (const p of presentaBackup) {
    if (!p.id_iniciativa) continue;
    if (!presentaPorIni.has(p.id_iniciativa)) presentaPorIni.set(p.id_iniciativa, []);
    presentaPorIni.get(p.id_iniciativa)!.push(p);
  }
  const comisionesPorPunto = new Map<string, typeof comisionesBackup>();
  for (const c of comisionesBackup) {
    if (!c.id_punto) continue;
    if (!comisionesPorPunto.has(c.id_punto)) comisionesPorPunto.set(c.id_punto, []);
    comisionesPorPunto.get(c.id_punto)!.push(c);
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
    const puntoVivo = await PuntosOrden.findByPk(Number(r.id_punto));
    if (!puntoVivo) {
      puntoMuerto++;
      continue;
    }
    const existente = await IniciativaPuntoOrden.findOne({ where: { id_punto: Number(r.id_punto) } as any });
    if (existente) {
      yaExistia++;
      continue;
    }

    if (!commit) {
      creadas++;
      continue;
    }

    try {
      await sequelize.transaction(async (t) => {
        const nueva = await IniciativaPuntoOrden.create(
          {
            id_punto: Number(r.id_punto),
            id_evento: (puntoVivo as any).id_evento,
            iniciativa: limpiarTexto(r.iniciativa),
            tipo: Number(r.tipo),
            path_doc: r.path_doc,
            precluida: r.precluida ? Number(r.precluida) : null,
            publico: 0,
          } as any,
          { transaction: t }
        );

        const presentantes = presentaPorIni.get(r.id!) || [];
        for (const p of presentantes) {
          await IniciativasPresenta.create(
            {
              id_iniciativa: nueva.id,
              id_tipo_presenta: p.id_tipo_presenta ? Number(p.id_tipo_presenta) : null,
              id_presenta: p.id_presenta,
            } as any,
            { transaction: t }
          );
        }

        const comisiones = comisionesPorPunto.get(r.id_punto!) || [];
        for (const c of comisiones) {
          await PuntosComisiones.create({ id_punto: Number(r.id_punto), id_comision: c.id_comision } as any, { transaction: t });
        }
        if (comisiones.length > 0) {
          await PuntosOrden.update({ se_turna_comision: 1 }, { where: { id: Number(r.id_punto) } as any, transaction: t });
        }
      });
      creadas++;
    } catch (err: any) {
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
  if (!commit) console.log('Corre con --commit para escribir de verdad.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('✖ Error fatal:', err);
  process.exit(1);
});
