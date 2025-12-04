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



