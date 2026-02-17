import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import AsistenciaVoto from "../models/asistencia_votos";
import VotosPunto from "../models/votos_punto";
import IntegranteComision from "../models/integrante_comisions";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import { Op } from "sequelize";
import TemasPuntosVotos from "../models/temas_puntos_votos";
import PuntosOrden from "../models/puntos_ordens";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";

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

export const actvototodos = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    if (!body.idpunto || body.sentido === undefined) {
      return res.status(400).json({
        msg: "Faltan datos requeridos: idpunto y sentido",
      });
    }
    
    let whereCondition: any;
    
    if (body.idReserva) {
      const temavotos = await TemasPuntosVotos.findOne({ 
        where: { id: body.idReserva } 
      });
      
      if (!temavotos) {
        return res.status(404).json({
          msg: "No se encontró el tema de votación",
        });
      }
      
      whereCondition = { id_tema_punto_voto: temavotos.id };
      
    } else {
      const punto = await PuntosOrden.findOne({ 
        where: { id: body.idpunto } 
      });
      
      if (!punto) {
        return res.status(404).json({
          msg: "No se encontró el punto",
        });
      }
      
      whereCondition = { id_punto: punto.id };
    }
    
    let nuevoSentido: number;
    let nuevoMensaje: string;
    
    switch (body.sentido) {
      case 0:
        nuevoSentido = 0;
        nuevoMensaje = "PENDIENTE";
        break;
      case 1:
        nuevoSentido = 1;
        nuevoMensaje = "A FAVOR";
        break;
      case 2:
        nuevoSentido = 2;
        nuevoMensaje = "ABSTENCIÓN";
        break;
      case 3:
        nuevoSentido = 3;
        nuevoMensaje = "EN CONTRA";
        break;
      default:
        return res.status(400).json({
          msg: "Sentido de voto inválido. Usa 0 (PENDIENTE), 1 (A FAVOR), 2 (ABSTENCIÓN) o 3 (EN CONTRA)",
        });
    }
    
    const [cantidadActualizada] = await VotosPunto.update(
      {
        sentido: nuevoSentido,
        mensaje: nuevoMensaje,
      },
      {
        where: whereCondition
      }
    );
    
    if (cantidadActualizada === 0) {
      return res.status(404).json({
        msg: "No se encontraron votos para actualizar",
      });
    }
    
    return res.status(200).json({
      msg: "Voto(s) actualizado(s) correctamente",
      estatus: 200,
      registrosActualizados: cantidadActualizada,
    });
    
  } catch (error) {
    console.error('Error al actualizar el voto:', error);
    return res.status(500).json({ 
      msg: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const creariniciativa = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    const punto = await PuntosOrden.findOne({
      where: { id: body.punto },
    });
    
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    
    const nuevoTema = await IniciativaPuntoOrden.create({
      id_punto: punto.id,
      id_evento: punto.id_evento,
      iniciativa: body.iniciativa,
      fecha_votacion: null,
      status: 1,
    });
    
    return res.status(200).json({ 
      message: "Iniciativa creada exitosamente",
    });
    
  } catch (error: any) {
    console.error("Error al crear la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const eliminariniciativa = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const iniciativa = await IniciativaPuntoOrden.findOne({ 
      where: { id }
    });
    if (!iniciativa) {
      return res.status(404).json({ message: "Iniciativa no encontrada" });
    }
    // await VotosPunto.destroy({
    //   where: { id_tema_punto_voto: id }
    // });
    await iniciativa.destroy();
    return res.status(200).json({
      message: "Iniciativa eliminada correctamente",
    });  
  } catch (error: any) {
    console.error("Error al eliminar la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const getiniciativas = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const iniciativa = await IniciativaPuntoOrden.findAll({ 
      where: { id_punto: id },
      attributes: ["id", "iniciativa"]
    });
    if (!iniciativa) {
      return res.status(404).json({ message: "No tiene iniciativas" });
    }
    return res.status(200).json({
      data: iniciativa,
    });  
  } catch (error: any) {
    console.error("Error al obtener las iniciativas:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

export const crariniidits = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    
    const punto = await PuntosOrden.findOne({
      where: { id: body.punto },
    });
    
    if (!punto) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    
    const iniciativa = await IniciativaPuntoOrden.findOne({
      where: { id: body.iniciativa },
    });

    if(iniciativa){
            await iniciativa.update({ id_punto: punto.id });
       }
    
    return res.status(200).json({ 
      message: "Iniciativa actualizada correctamente",
    });
    
  } catch (error: any) {
    console.error("Error al actualizar la iniciativa:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};



