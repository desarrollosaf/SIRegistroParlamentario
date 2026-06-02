import { Request, Response } from 'express';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import '../models/associations';

type CoordinadorDef = { apaterno: string; amaterno: string; nombres: string } | null;

const PARTIDOS: Record<string, { id: string; coordinador: CoordinadorDef }> = {
  morena: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480', coordinador: { apaterno: 'Vázquez',    amaterno: 'Rodríguez', nombres: 'José Francisco' } },
  verde:  { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e', coordinador: { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto'   } },
  pan:    { id: '16db3ac6-ca98-4d5f-b00a-d5ff6e8d828c', coordinador: null },
  pri:    { id: '7d2af11b-ed98-43f9-b7a9-a449c459cdf5', coordinador: null },
  pna:    { id: '136c3dbb-10a6-4aad-8c5f-bae3f72444ec', coordinador: null },
  pt:     { id: '3ed5f80b-f675-4c0b-b922-f9bdadce0fe0', coordinador: null },
  prd:    { id: 'c1fdb97c-2880-4268-8789-6a95d3769092', coordinador: null },
  mc:     { id: 'c6981a10-cc1f-4e3a-a08d-603485b0fc7c', coordinador: null },
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
