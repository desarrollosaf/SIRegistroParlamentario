import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import AsistenciaVoto from "../models/asistencia_votos";
import VotosPunto from "../models/votos_punto";
import IntegranteComision from "../models/integrante_comisions";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import { Op } from "sequelize";

export const cargoDiputados = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('holi')
    const diputados = await VotosPunto.findAll({
        where: {
            id_comision_dip: {
                [Op.ne]: null
            }
        }
    });
    
    for (const dips of diputados) {
       const integrante = await IntegranteLegislatura.findOne({
            where: {
                diputado_id: dips.id_diputado
            }
       });
       const comision = await IntegranteComision.findOne({
            where: {
                comision_id: dips.id_comision_dip,
                integrante_legislatura_id: integrante?.id
            }
       })
       if(comision){
            await dips.update({ id_cargo_dip: comision.tipo_cargo_comision_id });
            console.log('entre comision')
       }

    }


   return res.status(200).json({
      msg: "Exito",
    });
    
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los eventos",
      error: (error as Error).message
    });
  }
};


export const actualizartodos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    if (!body.id) {
      return res.status(400).json({
        msg: "El campo 'id' es requerido",
        estatus: 400
      });
    }

    if (body.sentido === undefined || body.sentido === null) {
      return res.status(400).json({
        msg: "El campo 'sentido' es requerido",
        estatus: 400
      });
    }

    const voto = await AsistenciaVoto.findAll({
      where: {
        id_agenda: body.id,
      },
    });

    if (!voto) {
      return res.status(404).json({
        msg: "No se encontró el registro de asistencia",
        estatus: 404
      });
    }

    let nuevoSentido: number;
    let nuevoMensaje: string;

    switch (body.sentido) {
      case 1:
        nuevoSentido = 1;
        nuevoMensaje = "ASISTENCIA";
        break;
      case 2:
        nuevoSentido = 2;
        nuevoMensaje = "ASISTENCIA ZOOM";
        break;
      case 0:
        nuevoSentido = 0;
        nuevoMensaje = "PENDIENTE";
        break;
      default:
        return res.status(400).json({
          msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (ASISTENCIA) o 2 (ASISTENCIA ZOOM)",
          estatus: 400
        });
    }


    await AsistenciaVoto.update(
      {
        sentido_voto: nuevoSentido,
        mensaje: nuevoMensaje,
      },
      {
        where: {
        id_agenda: body.id,
        },
      }
    );

    return res.status(200).json({
      msg: "Actualizados correctamente",
      estatus: 200,

    });

  } catch (error) {
    console.error('Error al actualizar toda la asistencia:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      estatus: 500,
      error: (error as Error).message 
    });
  }
};



