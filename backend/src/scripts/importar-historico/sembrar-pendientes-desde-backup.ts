/**
 * Siembra los folios que NUNCA se sembraron (no están en inciativas_puntos_ordens
 * todavía), usando el backup vía `id_sap` = folio — mismo mecanismo exacto
 * que ya usamos para tipo/path_doc/presenta. NO toca ningún folio ya
 * sembrado (los deja completamente intactos).
 *
 * Trae del backup: id_punto/tipo/path_doc/iniciativa (texto real),
 * iniciativas_presenta (presentante real, puede haber varios) y
 * puntos_comisiones (comisión real turnada). El id_evento se toma del
 * `puntos_ordens` VIVO (no del backup) para garantizar consistencia con el
 * estado actual de esa tabla.
 *
 * No crea ninguna cadena de iniciativas_estudios — eso, si se necesita, se
 * ataca aparte (igual que hicimos con buscar-cierre-faltante.ts).
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-pendientes-desde-backup.ts --commit
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Op } from 'sequelize';

import sequelize from '../../database/registrocomisiones';
import PuntosOrden from '../../models/puntos_ordens';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';
import { leerTablaDeDump } from './leer-backup-sql';

const DUMP = '/Users/martinsg/Documents/parlamentario/dump-adminplem_registroparlamentariobk-202608061035.sql';
const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');

const COL_INI = ['id', 'id_punto', 'id_evento', 'iniciativa', 'tipo', 'fecha_votacion', 'status', 'expediente', 'path_doc', 'precluida', 'publico', 'id_sap', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_PRESENTA = ['id', 'id_iniciativa', 'id_tipo_presenta', 'id_presenta', 'createdAt', 'updatedAt', 'deletedAt'];
const COL_COMISIONES = ['id', 'id_punto', 'id_comision', 'createdAt', 'updatedAt', 'id_punto_turno'];

function limpiarTexto(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}

async function main() {
  const commit = process.argv.includes('--commit');

  const filas: any[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const porFolio = new Map<string, any[]>();
  for (const f of filas) {
    if (!porFolio.has(f.folio)) porFolio.set(f.folio, []);
    porFolio.get(f.folio)!.push(f);
  }
  // Nota: aquí NO se filtra por Bandera "Revisar" — el backup da una llave
  // exacta (id_sap = folio) verificada, así que la calidad del texto del
  // Excel no importa para esta fuente (no se usa texto para matchear, solo
  // para decidir `precluida` según el Estado final).
  const todosLosFolios = [...porFolio.entries()];

  const yaSembradas = await IniciativaPuntoOrden.findAll({ where: { folio_historico: { [Op.ne]: null } } as any, attributes: ['folio_historico'] });
  const yaSembradosSet = new Set(yaSembradas.map((s: any) => s.folio_historico));

  const pendientes = todosLosFolios.filter(([folio]) => !yaSembradosSet.has(Number(folio)));
  console.log(`Folios pendientes (nunca sembrados): ${pendientes.length}`);

  const inisBackup = leerTablaDeDump(DUMP, 'inciativas_puntos_ordens', COL_INI);
  const presentaBackup = leerTablaDeDump(DUMP, 'iniciativas_presenta', COL_PRESENTA);
  const comisionesBackup = leerTablaDeDump(DUMP, 'puntos_comisiones', COL_COMISIONES);

  const iniPorSap = new Map<number, typeof inisBackup[0]>();
  for (const i of inisBackup) if (i.id_sap) iniPorSap.set(Number(i.id_sap), i);

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
  let sinBackup = 0;
  let sinPuntoVivo = 0;
  let errores = 0;

  for (const [folio, filasFolio] of pendientes) {
    const backupIni = iniPorSap.get(Number(folio));
    if (!backupIni) {
      sinBackup++;
      continue;
    }

    const puntoVivo = await PuntosOrden.findByPk(Number(backupIni.id_punto));
    if (!puntoVivo) {
      sinPuntoVivo++;
      continue;
    }

    const usablesFolio = filasFolio.filter((f: any) => !f.bandera.startsWith('Revisar'));
    const filasParaEstado = usablesFolio.length > 0 ? usablesFolio : filasFolio;
    const estadoFinal = filasParaEstado[filasParaEstado.length - 1].estado;

    if (!commit) {
      creadas++;
      continue;
    }

    try {
      await sequelize.transaction(async (t) => {
        const nuevaIniciativa = await IniciativaPuntoOrden.create(
          {
            id_punto: Number(backupIni.id_punto),
            id_evento: (puntoVivo as any).id_evento,
            iniciativa: limpiarTexto(backupIni.iniciativa),
            tipo: backupIni.tipo ? Number(backupIni.tipo) : null,
            path_doc: backupIni.path_doc,
            precluida: estadoFinal === 'Precluida' ? 1 : null,
            publico: 0,
            folio_historico: Number(folio),
          } as any,
          { transaction: t }
        );

        const presentantes = presentaPorIni.get(backupIni.id!) || [];
        for (const p of presentantes) {
          await IniciativasPresenta.create(
            {
              id_iniciativa: nuevaIniciativa.id,
              id_tipo_presenta: p.id_tipo_presenta ? Number(p.id_tipo_presenta) : null,
              id_presenta: p.id_presenta,
            } as any,
            { transaction: t }
          );
        }

        const comisiones = comisionesPorPunto.get(backupIni.id_punto!) || [];
        for (const c of comisiones) {
          await PuntosComisiones.create(
            { id_punto: Number(backupIni.id_punto), id_comision: c.id_comision } as any,
            { transaction: t }
          );
        }
        if (comisiones.length > 0) {
          await PuntosOrden.update({ se_turna_comision: 1 }, { where: { id: Number(backupIni.id_punto) } as any, transaction: t });
        }
      });
      creadas++;
    } catch (err: any) {
      errores++;
      console.error(`✖ Folio ${folio}: ${err.message}`);
    }
  }

  console.log('\n══════════ RESUMEN ══════════');
  console.log(`Iniciativas nuevas creadas: ${creadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
  console.log(`Sin fila en backup: ${sinBackup}`);
  console.log(`Con fila en backup pero id_punto ya no vive: ${sinPuntoVivo}`);
  console.log(`Errores: ${errores}`);
  console.log('═══════════════════════════════\n');
  if (!commit) console.log('Corre con --commit para escribir de verdad.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('✖ Error fatal:', err);
  process.exit(1);
});
