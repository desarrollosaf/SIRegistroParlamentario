import { Request, Response } from 'express';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import { construirReporteBase } from './estadistico';
import '../models/associations';

type CoordinadorDef = { apaterno: string; amaterno: string; nombres: string } | null;

const PARTIDOS: Record<string, { id: string; coordinador: CoordinadorDef }> = {
  morena: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480', coordinador: { apaterno: 'Vázquez',    amaterno: 'Rodríguez', nombres: 'José Francisco' } },
  verde:  { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e', coordinador: { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto'   } },
  pan:    { id: '16db3ac6-ca98-4d5f-b00a-d5ff6e8d828c', coordinador: { apaterno: 'Fernández de Cevallos', amaterno: 'González', nombres: 'Pablo' } },
  pri:    { id: '7d2af11b-ed98-43f9-b7a9-a449c459cdf5', coordinador: { apaterno: 'Rescala', amaterno: 'Jiménez', nombres: 'Elías' } },
  pna:    { id: '136c3dbb-10a6-4aad-8c5f-bae3f72444ec', coordinador: null },
  pt:     { id: '3ed5f80b-f675-4c0b-b922-f9bdadce0fe0', coordinador: { apaterno: 'González', amaterno: 'Yáñez', nombres: 'Óscar' } },
  prd:    { id: 'c1fdb97c-2880-4268-8789-6a95d3769092', coordinador: { apaterno: 'Ortega', amaterno: 'Álvarez', nombres: 'Omar' } },
  mc:     { id: 'c6981a10-cc1f-4e3a-a08d-603485b0fc7c', coordinador: { apaterno: 'Zepeda', amaterno: 'Hernández', nombres: 'Juan Manuel' } },
};

export const getIntegrantesPartido = async (req: Request, res: Response): Promise<Response> => {
  const slug = req.params.slug.toLowerCase().trim();
  const config = PARTIDOS[slug];

  if (!config) {
    return res.status(404).json({ msg: `Partido '${slug}' no configurado` });
  }

  try {
    const partido = await Partidos.findOne({
      where: { id: config.id },
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integrante_legislaturas',
          where: { fecha_fin: null },
          include: [{ model: Diputado, as: 'diputado', attributes: ['id', 'apaterno', 'amaterno', 'nombres'] }],
        },
      ],
    });

    if (!partido) {
      return res.status(404).json({ msg: 'Partido no encontrado en base de datos' });
    }

    const integrantes = ((partido as any).integrante_legislaturas ?? []).map((i: any) => {
      const d = i.diputado;
      const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
      const esCoordinador =
        config.coordinador !== null &&
        d?.apaterno === config.coordinador.apaterno &&
        d?.amaterno === config.coordinador.amaterno &&
        d?.nombres  === config.coordinador.nombres;

      return { id: i.id, nombre, coordinador: esCoordinador };
    });

    return res.status(200).json({
      msg: 'Exito',
      partido: { id: partido.id, nombre: partido.nombre, siglas: partido.siglas },
      total: integrantes.length,
      integrantes,
    });
  } catch (error) {
    console.error('Error obteniendo integrantes:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: (error as Error).message });
  }
};

// ─── Helpers para construir el timeline ──────────────────────────────────────

function construirTimeline(item: any): { paso: number; evento: string; fecha: string; detalle: string }[] {
  const pasos: { paso: number; evento: string; fecha: string; detalle: string }[] = [];
  let paso = 1;

  pasos.push({
    paso: paso++,
    evento: 'Presentación',
    fecha: item.presentac ?? '-',
    detalle: item.materia ?? '-',
  });

  if (item.comisiones && item.comisiones !== '-') {
    pasos.push({
      paso: paso++,
      evento: 'Turno a comisión',
      fecha: item.presentac ?? '-',
      detalle: item.comisiones,
    });
  }

  const estadosIntermedios = ['En estudio', 'Rechazada en comisión'];
  if (estadosIntermedios.includes(item.observac)) {
    pasos.push({
      paso: paso++,
      evento: item.observac,
      fecha: '-',
      detalle: item.comisiones && item.comisiones !== '-' ? item.comisiones : 'En proceso',
    });
  }

  if (item.observac === 'Precluida') {
    pasos.push({ paso: paso++, evento: 'Precluida', fecha: '-', detalle: 'Iniciativa precluida' });
  }

  if (item.observac === 'Aprobada' || item.observac === 'Rechazada en sesión') {
    pasos.push({
      paso: paso++,
      evento: item.observac,
      fecha: item.expedicion ?? '-',
      detalle: item.observac === 'Aprobada'
        ? `Expedición: ${item.expedicion ?? '-'}`
        : 'Rechazada en sesión plenaria',
    });
  }

  return pasos;
}

export const buscarIniciativa = async (req: Request, res: Response): Promise<Response> => {
  const q = ((req.query.q as string) ?? '').trim();

  if (!q || q.length < 3) {
    return res.status(400).json({ msg: 'El parámetro q debe tener al menos 3 caracteres' });
  }

  try {
    const reporte = await construirReporteBase();
    const terminos = q.toLowerCase().split(/\s+/).filter(Boolean);

    const coincidencias = reporte.filter((item) => {
      const haystack = [
        item.iniciativa,
        item.autor,
        item.autor_detalle,
        item.materia,
        item.grupo_parlamentario,
      ].join(' ').toLowerCase();

      return terminos.every((t) => haystack.includes(t));
    });

    if (!coincidencias.length) {
      return res.status(200).json({ msg: 'Sin resultados', total: 0, resultados: [] });
    }

    const resultados = coincidencias.map((item) => ({
      id:                 item.id,
      iniciativa:         item.iniciativa,
      autor:              item.autor,
      autor_detalle:      item.autor_detalle,
      grupo_parlamentario: item.grupo_parlamentario,
      estado_actual:      item.observac,
      aprobada:           item.aprobada,
      presentacion:       item.presentac,
      expedicion:         item.expedicion,
      periodo:            item.periodo,
      documento:          item.documento ?? null,
      timeline:           construirTimeline(item),
    }));

    return res.status(200).json({ msg: 'Exito', total: resultados.length, resultados });
  } catch (error) {
    console.error('Error buscando iniciativa:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al buscar la iniciativa', error: (error as Error).message });
  }
};
