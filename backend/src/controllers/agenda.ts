import { Request, Response } from "express";
import Agenda from '../models/agendas';
import Sedes from "../models/sedes";
import TipoEventos from "../models/tipo_eventos";
import AnfitrionAgenda from "../models/anfitrion_agendas";
import Legislatura from "../models/legislaturas";
import IntegranteLegislatura from "../models/integrante_legislaturas";
import Diputado from "../models/diputado";
import IntegranteComision from "../models/integrante_comisions";
import AsistenciaVoto from "../models/asistencia_votos";
import { setEngine } from "node:crypto";
import Partidos from "../models/partidos";


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

export const getevento = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const evento = await Agenda.findOne({
      where: { id },
      include: [
        { model: Sedes, as: "sede", attributes: ["id", "sede"] },
        { model: TipoEventos, as: "tipoevento", attributes: ["id", "nombre"] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const asistenciasExistentes = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      raw: true,
    });

    if (asistenciasExistentes.length > 0) {
      const resultados = await Promise.all(
        asistenciasExistentes.map(async (inte) => {
          const diputado = await Diputado.findOne({
            where: { id: inte.id_diputado },
            attributes: ["apaterno", "amaterno", "nombres"],
            raw: true,
          });

          const partido = await Partidos.findOne({
            where: { id: inte.partido_dip },
            attributes: ["siglas"],
            raw: true,
          });

          const nombreCompletoDiputado = diputado
            ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
            : null;

          return {
            ...inte,
            diputado: nombreCompletoDiputado,
            partido: partido ? partido.siglas : null,
          };
        })
      );

      return res.status(200).json({
        msg: "Evento con asistencias existentes",
        evento,
        integrantes: resultados,
      });
    }

    const listadoDiputados: { id_diputado: string; id_partido: string; bandera: number }[] = [];
    let bandera = 1;

    if (evento.tipoevento?.nombre === "Sesión") {
      const legislatura = await Legislatura.findOne({
        order: [["fecha_inicio", "DESC"]],
      });

      if (legislatura) {
        const diputados = await IntegranteLegislatura.findAll({
          where: { legislatura_id: legislatura.id },
          include: [{ model: Diputado, as: "diputado" }],
        });

        for (const inteLegis of diputados) {
          if (inteLegis.diputado) {
            listadoDiputados.push({
              id_diputado: inteLegis.diputado.id,
              id_partido: inteLegis.partido_id,
              bandera,
            });
          }
        }
      }
    } else {
      const comisiones = await AnfitrionAgenda.findAll({
        where: { agenda_id: evento.id },
      });

      if (comisiones.length > 0) {
        const comisionIds = comisiones.map((c) => c.autor_id);
        const integrantes = await IntegranteComision.findAll({
          where: { comision_id: comisionIds },
          include: [
            {
              model: IntegranteLegislatura,
              as: "integranteLegislatura",
              include: [{ model: Diputado, as: "diputado" }],
            },
          ],
        });

        for (const comId of comisionIds) {
          const deEstaComision = integrantes.filter(
            (i) => i.comision_id === comId && i.integranteLegislatura?.diputado
          );
          for (const inte of deEstaComision) {
            listadoDiputados.push({
              id_diputado: inte.integranteLegislatura!.diputado!.id,
              id_partido: inte.integranteLegislatura!.partido_id,
              bandera,
            });
          }
          bandera++;
        }
      }
    }

    const mensaje = "PENDIENTE";
    const timestamp = new Date();

    const asistencias = listadoDiputados.map((diputado) => ({
      sentido_voto: 0,
      mensaje,
      timestamp,
      id_diputado: diputado.id_diputado,
      partido_dip: diputado.id_partido,
      id_agenda: evento.id,
    }));

    await AsistenciaVoto.bulkCreate(asistencias);
    const nuevasAsistencias = await AsistenciaVoto.findAll({
      where: { id_agenda: id },
      raw: true,
    });

    const resultados = await Promise.all(
      nuevasAsistencias.map(async (inte) => {
        const diputado = await Diputado.findOne({
          where: { id: inte.id_diputado },
          attributes: ["apaterno", "amaterno", "nombres"],
          raw: true,
        });

        const partido = await Partidos.findOne({
          where: { id: inte.partido_dip },
          attributes: ["siglas"],
          raw: true,
        });

        const nombreCompletoDiputado = diputado
          ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
          : null;

        return {
          ...inte,
          diputado: nombreCompletoDiputado,
          partido: partido ? partido.siglas : null,
        };
      })
    );

    return res.status(200).json({
      msg: "Evento generado correctamente",
      evento,
      integrantes: resultados,
    });
  } catch (error) {
    console.error("Error obteniendo evento:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al obtener el evento",
      error: (error as Error).message,
    });
  }
};