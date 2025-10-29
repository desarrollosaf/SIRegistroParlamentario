import { Request, Response } from "express";
import Agenda from '../models/agendas';


export const geteventos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const eventos = await Agenda.findAll();
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