/**
 * Puebla `inciativas_puntos_ordens.materia` para las iniciativas sembradas
 * desde el Excel (folio_historico no nulo), usando la columna "Materia
 * (referencia)" del propio Excel — no existe en el backup (esa tabla nunca
 * tuvo este campo), así que el Excel es la única fuente para esto.
 *
 * Solo toca la columna `materia`, nada más.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-materia.ts --commit
 */
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { parse } from 'csv-parse/sync';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');

function limpiarTexto(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}

async function main() {
  const commit = process.argv.includes('--commit');

  const filas: any[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const materiaPorFolio = new Map<number, string>();
  for (const f of filas) {
    if (!materiaPorFolio.has(Number(f.folio)) && f.materia) {
      materiaPorFolio.set(Number(f.folio), f.materia);
    }
  }

  const sembradas = await IniciativaPuntoOrden.findAll({ where: { folio_historico: { [Op.ne]: null } } as any });
  console.log(`Iniciativas del Excel a revisar: ${sembradas.length}`);

  let actualizadas = 0;
  let sinMateria = 0;

  for (const ini of sembradas as any[]) {
    const materia = materiaPorFolio.get(ini.folio_historico);
    if (!materia) {
      sinMateria++;
      continue;
    }
    if (commit) {
      await ini.update({ materia: limpiarTexto(materia) });
    }
    actualizadas++;
  }

  console.log(`Actualizadas: ${actualizadas}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
  console.log(`Sin materia en el Excel: ${sinMateria}`);
  if (!commit) console.log('Corre con --commit para escribir de verdad.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('✖ Error:', err);
  process.exit(1);
});
