import { Request, Response } from 'express';
import Partidos from '../models/partidos';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import Diputado from '../models/diputado';
import '../models/associations';

const COORDINADOR_MORENA = { apaterno: 'Vázquez', amaterno: 'Rodríguez', nombres: 'José Francisco' };
const COORDINADOR_VERDE  = { apaterno: 'Couttolenc', amaterno: 'Buentello', nombres: 'José Alberto' };

function mapIntegrantes(lista: any[], coordinador: { apaterno: string; amaterno: string; nombres: string }) {
  return lista.map((i: any) => {
    const d = i.diputado;
    const nombre = d ? `${d.apaterno} ${d.amaterno} ${d.nombres}`.trim() : '';
    const esCoordinador =
      d?.apaterno === coordinador.apaterno &&
      d?.amaterno === coordinador.amaterno &&
      d?.nombres === coordinador.nombres;

    return { id: i.id, nombre, coordinador: esCoordinador };
  });
}

export const getIntegrantesMorena = async (req: Request, res: Response): Promise<Response> => {
  try {
    const partido = await Partidos.findOne({
      where: { id: '947b16d0-1803-4c64-be3f-7b4e83a60480' },
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
      return res.status(404).json({ msg: 'Grupo parlamentario de Morena no encontrado' });
    }

    const integrantes = mapIntegrantes((partido as any).integrante_legislaturas ?? [], COORDINADOR_MORENA);

    return res.status(200).json({ msg: 'Exito', total: integrantes.length, integrantes });
  } catch (error) {
    console.error('Error obteniendo integrantes de Morena:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: (error as Error).message });
  }
};

export const getIntegrantesVerde = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const partido = await Partidos.findOne({
      where: { id: '1342c104-d5ec-4eda-b5ca-7d653b440a5e' },
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
      return res.status(404).json({ msg: 'Grupo parlamentario del Partido Verde no encontrado' });
    }

    const integrantes = mapIntegrantes((partido as any).integrante_legislaturas ?? [], COORDINADOR_VERDE);

    return res.status(200).json({ msg: 'Exito', total: integrantes.length, integrantes });
  } catch (error) {
    console.error('Error obteniendo integrantes del Verde:', error);
    return res.status(500).json({ msg: 'Ocurrió un error al obtener los integrantes', error: (error as Error).message });
  }
};
