import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import '../models/associations';

export const getIntegrantesMorena = async (req: Request, res: Response): Promise<Response> => {
  try {
    const partido = await Partidos.findOne({
      where: {
        [Op.or]: [
          { siglas: { [Op.like]: '%MORENA%' } },
          { nombre: { [Op.like]: '%Morena%' } },
        ],
      },
      include: [
        {
          model: IntegranteLegislatura,
          as: 'integrante_legislaturas',
          include: [
            {
              model: Diputado,
              as: 'diputado',
              attributes: ['id', 'apaterno', 'amaterno', 'nombres', 'alias', 'email', 'telefono', 'facebook', 'twitter', 'instagram'],
            },
          ],
        },
      ],
    });

    if (!partido) {
      return res.status(404).json({ msg: 'Grupo parlamentario de Morena no encontrado' });
    }

    return res.status(200).json({
      msg: 'Exito',
      data: (partido as any).integrante_legislaturas ?? [],
    });
  } catch (error) {
    console.error('Error obteniendo integrantes de Morena:', error);
    return res.status(500).json({
      msg: 'Ocurrió un error al obtener los integrantes',
      error: (error as Error).message,
    });
  }
};
