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
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativaEstudio from '../../models/iniciativas_estudio';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';

const MAPEO_PATH = path.resolve(__dirname, '../../data/mapeo-puntos-historico.json');

async function main() {
  if (!fs.existsSync(MAPEO_PATH)) {
    throw new Error(`No existe ${MAPEO_PATH}. Corre primero exportar-mapeo.ts (con los datos aún sin borrar).`);
  }
  const mapeo: any[] = JSON.parse(fs.readFileSync(MAPEO_PATH, 'utf8'));

  const todosLosPuntoIds = new Set<number>();
  for (const f of mapeo) {
    todosLosPuntoIds.add(Number(f.puntoPresentacionId));
    for (const p of f.pasos) todosLosPuntoIds.add(Number(p.puntoId));
  }
  const puntoIdsArray = [...todosLosPuntoIds];
  console.log(`puntos_ordens involucrados (NO se borran, solo se usan para acotar el borrado): ${puntoIdsArray.length}`);

  const inis = await IniciativaPuntoOrden.findAll({ where: { folio_historico: { [Op.ne]: null } } });
  const iniciativaIds = inis.map((i: any) => i.id);
  console.log(`inciativas_puntos_ordens a borrar: ${iniciativaIds.length}`);

  const bComisiones = await PuntosComisiones.destroy({ where: { id_punto: { [Op.in]: puntoIdsArray } } });
  console.log(`puntos_comisiones borradas: ${bComisiones}`);

  const bEstudios = await IniciativaEstudio.destroy({
    where: {
      [Op.or]: [
        { punto_origen_id: { [Op.in]: puntoIdsArray } },
        { punto_destino_id: { [Op.in]: puntoIdsArray } },
      ],
    },
    force: true,
  });
  console.log(`iniciativas_estudios borradas: ${bEstudios}`);

  const bPresenta = await IniciativasPresenta.destroy({
    where: { id_iniciativa: { [Op.in]: iniciativaIds } },
    force: true,
  });
  console.log(`iniciativas_presenta borradas: ${bPresenta}`);

  const bIniciativas = await IniciativaPuntoOrden.destroy({
    where: { folio_historico: { [Op.ne]: null } },
    force: true,
  });
  console.log(`inciativas_puntos_ordens borradas: ${bIniciativas}`);

  console.log('\n✔ Limpieza terminada. agendas y puntos_ordens NO se tocaron.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✖ Error borrando:', err);
    process.exit(1);
  });
