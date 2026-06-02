import { Request, Response } from 'express';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import '../models/associations';

const COORDINADOR = { apaterno: 'Vázquez', amaterno: 'Rodríguez', nombres: 'José Francisco' };

export const getIntegrantesMorena = async (req: Request, res: Response): Promise<Response> => {
  try {
    const partido = await Partidos.findOne({
      where: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480' },
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integrante_legislaturas',
          where: { fecha_fin: null },
          include: [
            {
              model: Diputado,
              as: 'diputado',
              attributes: ['id', 'apaterno', 'amaterno', 'nombres'],
            },
          ],
        },
      ],
    });

    if (!partido) {
      return res.status(404).json({ msg: 'Grupo parlamentario de Morena no encontrado' });
    }

    const integrantes = ((partido as any).integrante_legislaturas ?? []).map((i: any) => {
      const d = i.diputado;
      const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
      const esCoordinador =
        d?.apaterno === COORDINADOR.apaterno &&
        d?.amaterno === COORDINADOR.amaterno &&
        d?.nombres === COORDINADOR.nombres;

      return {
        id: i.id,
        nombre,
        coordinador: esCoordinador,
      };
    });

    return res.status(200).json({
      msg: 'Exito',
      data: integrantes,
    });
  } catch (error) {
    console.error('Error obteniendo integrantes de Morena:', error);
    return res.status(500).json({
      msg: 'Ocurrió un error al obtener los integrantes',
      error: (error as Error).message,
    });
  }
};
