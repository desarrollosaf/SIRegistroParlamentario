import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import TipoEventos from "../models/tipo_eventos";


export const geteventos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventos = await Agenda.findAll(
      {
        include: [
        {
          model: Sedes,
          as: "sede",
          attributes: ["id", "sede"]
        },
        {
          model: TipoEventos,
          as: "tipoevento",
          attributes: ["id", "nombre"]
        }
      ],  
      }
    );
    return res.status(200).json({
      msg: "listoooo :v ",
      citas: eventos
    });
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener los eventos",
      error: (error as Error).message
    });
  }
};