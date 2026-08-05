/**
 * Exporta, ANTES de borrar nada, el mapeo folio_historico -> puntos_ordens ya
 * creados (presentación + cadena de estudio/dictamen), leyendo el estado
 * actual de la BD. Se usa para poder borrar inciativas_puntos_ordens /
 * iniciativas_estudios / iniciativas_presenta / puntos_comisiones y volver a
 * sembrarlos apuntando A LOS MISMOS agendas/puntos_ordens que ya existen
 * (que el usuario confirmó que están correctos), sin duplicarlos.
 */
import fs from 'fs';
import path from 'path';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativaEstudio from '../../models/iniciativas_estudio';

const DESTINO = path.resolve(__dirname, '../../data/mapeo-puntos-historico.json');

interface Paso {
  puntoId: number;
  status: string;
  esCierre: boolean;
}

interface MapeoFolio {
  folio: number;
  puntoPresentacionId: number;
  sesionAgendaId: string;
  pasos: Paso[];
}

async function main() {
  const inis = await IniciativaPuntoOrden.findAll({
    where: { folio_historico: { [require('sequelize').Op.ne]: null } },
  });

  console.log(`Iniciativas históricas encontradas: ${inis.length}`);

  const mapeo: MapeoFolio[] = [];

  for (const ini of inis) {
    const puntoPresentacionId = (ini as any).id_punto;
    const sesionAgendaId = (ini as any).id_evento;
    const pasos: Paso[] = [];

    let puntoActual = puntoPresentacionId;
    const visitados = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const estudio = await IniciativaEstudio.findOne({ where: { punto_origen_id: puntoActual } });
      if (!estudio) break;
      const destino = (estudio as any).punto_destino_id;
      const esCierre = destino === puntoActual;
      pasos.push({ puntoId: destino, status: String((estudio as any).status), esCierre });
      if (esCierre || visitados.has(destino)) break;
      visitados.add(destino);
      puntoActual = destino;
    }

    mapeo.push({
      folio: (ini as any).folio_historico,
      puntoPresentacionId,
      sesionAgendaId,
      pasos,
    });
  }

  fs.writeFileSync(DESTINO, JSON.stringify(mapeo, null, 2), 'utf8');
  console.log(`✔ Mapeo exportado: ${DESTINO}`);
  console.log(`  Folios mapeados: ${mapeo.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✖ Error exportando mapeo:', err);
    process.exit(1);
  });
