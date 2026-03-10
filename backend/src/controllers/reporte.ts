import { Request, Response } from "express";
import { Op } from "sequelize";
const ExcelJS = require("exceljs");

import Agenda from "../models/agendas";
import PuntosOrden from "../models/puntos_ordens";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";
import IniciativaEstudio from "../models/iniciativas_estudio";
import TipoEventos from "../models/tipo_eventos";
import Comision from "../models/comisions";
import AnfitrionAgenda from "../models/anfitrion_agendas";
import PuntosComisiones from "../models/puntos_comisiones";
import PuntosPresenta from "../models/puntos_presenta";
import Proponentes from "../models/proponentes";
import CatFunDep from "../models/cat_fun_dep";
import Secretarias from "../models/secretarias";
import Legislatura from "../models/legislaturas";
import Partidos from "../models/partidos";
import MunicipiosAg from "../models/municipiosag";
import Diputado from "../models/diputado";
import ExpedienteEstudiosPuntos from "../models/expedientes_estudio_puntos";

export const getifnini = async (req: Request, res: Response): Promise<any> => {
  try {
    const iniciativas = await IniciativaPuntoOrden.findAll({
      attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente"],
      include: [
        {
          model: PuntosOrden,
          as: "punto",
          attributes: ["id", "punto", "nopunto", "tribuna"],
          include: [
            {
              model: IniciativaEstudio,
              as: "estudio",
              attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
              required: false,
              include: [
                {
                  model: PuntosOrden,
                  as: "iniciativa",
                  attributes: ["id", "punto", "nopunto", "tribuna"],
                  include: [
                    {
                      model: Agenda,
                      as: "evento",
                      attributes: ["id", "fecha", "descripcion", "liga"],
                      include: [
                        {
                          model: TipoEventos,
                          as: "tipoevento",
                          attributes: ["nombre"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: ExpedienteEstudiosPuntos,
          as: "expedienteturno",
          attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
          include: [
            {
              model: IniciativaEstudio,
              as: "estudio",
              attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
              required: false,
              include: [
                {
                  model: PuntosOrden,
                  as: "iniciativa",
                  attributes: ["id", "punto", "nopunto", "tribuna"],
                  include: [
                    {
                      model: Agenda,
                      as: "evento",
                      attributes: ["id", "fecha", "descripcion", "liga"],
                      include: [
                        {
                          model: TipoEventos,
                          as: "tipoevento",
                          attributes: ["nombre"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Agenda,
          as: "evento",
          attributes: ["id", "fecha", "descripcion", "liga"],
          include: [
            {
              model: TipoEventos,
              as: "tipoevento",
              attributes: ["nombre"]
            }
          ]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    const reporte = await Promise.all(
      iniciativas.map(async (iniciativa, index) => {
        const data: any = iniciativa.toJSON();

        const { proponentesString, presentaString } = await getPresentantesDePunto(data.id_punto);

        const todosEstudios = [
          ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
          ...(Array.isArray(data.expedienteturno)
            ? data.expedienteturno.flatMap((exp: any) =>
                Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : []
              )
            : [])
        ];

        const fuenteEstudios = deduplicarPorId(todosEstudios);

        const estudios = fuenteEstudios.filter((e: any) => e.status === "1");
        const dictamenes = fuenteEstudios.filter((e: any) => e.status === "2");
        const rechazadocomi = fuenteEstudios.filter((e: any) => e.status === "4");
        const rechazosesion = fuenteEstudios.filter((e: any) => e.status === "5");

        const posiblesPuntosIds = [
          data.punto?.id,
          ...fuenteEstudios.map((e: any) => e.punto_destino_id).filter(Boolean)
        ];

        const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds)];

        const expedientesRelacionados = await ExpedienteEstudiosPuntos.findAll({
          where: {
            punto_origen_sesion_id: {
              [Op.in]: posiblesPuntosUnicos
            }
          },
          attributes: ["id", "expediente_id", "punto_origen_sesion_id"]
        });

        const expedienteIds = [
          ...new Set(
            expedientesRelacionados
              .map((e: any) => e.expediente_id)
              .filter(Boolean)
          )
        ];

        const cierresDB = await IniciativaEstudio.findAll({
          where: {
            status: "3",
            [Op.or]: [
              {
                punto_origen_id: {
                  [Op.in]: posiblesPuntosUnicos
                }
              },
              {
                punto_origen_id: {
                  [Op.in]: expedienteIds
                }
              }
            ]
          },
          include: [
            {
              model: PuntosOrden,
              as: "iniciativa",
              attributes: ["id", "punto", "nopunto", "tribuna"],
              include: [
                {
                  model: Agenda,
                  as: "evento",
                  attributes: ["id", "fecha", "descripcion", "liga"],
                  include: [
                    {
                      model: TipoEventos,
                      as: "tipoevento",
                      attributes: ["nombre"]
                    }
                  ]
                }
              ]
            }
          ]
        });

        const cierresMerge = [
          ...fuenteEstudios.filter((e: any) => e.status === "3"),
          ...cierresDB.map((c: any) => c.toJSON())
        ];

        const cierres = deduplicarPorId(cierresMerge);

        const cierrePrincipal = cierres.length > 0 ? cierres[0] : null;

        let observacion = "Pendiente";
        if (cierrePrincipal) {
          observacion = "Aprobada";
        } else if (rechazosesion.length > 0) {
          observacion = "Rechazada en sesión";
        } else if (rechazadocomi.length > 0) {
          observacion = "Rechazada en comisión";
        } else if (dictamenes.length > 0) {
          observacion = "Dictaminada";
        } else if (estudios.length > 0) {
          observacion = "En estudio";
        }

        const turnadoInfo = await getComisionesTurnado(data.punto?.id);
        const anfitrionesNacio = await getAnfitriones(
          data.evento?.id,
          data.evento?.tipoevento?.nombre
        );

        const fechaExpedicion =
          cierrePrincipal?.iniciativa?.evento?.fecha
            ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
            : "-";

        return {
          no: index + 1,
          autor: proponentesString || "-",
          autor_detalle: presentaString || "-",
          iniciativa: data.iniciativa ?? "-",
          materia: data.punto?.punto ?? "-",
          presentac: formatearFechaCorta(data.evento?.fecha),
          comisiones: turnadoInfo.comisiones_turnado || anfitrionesNacio.comisiones || "-",
          expedicion: fechaExpedicion,
          observac: observacion
        };
      })
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte Iniciativas");

    worksheet.columns = [
      { header: "NO.", key: "no", width: 8 },
      { header: "AUTOR", key: "autor", width: 25 },
      { header: "PRESENTA", key: "autor_detalle", width: 35 },
      { header: "INICIATIVA", key: "iniciativa", width: 55 },
      { header: "MATERIA", key: "materia", width: 45 },
      { header: "PRESENTAC.", key: "presentac", width: 15 },
      { header: "COMISIONES", key: "comisiones", width: 40 },
      { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
      { header: "OBSERVAC.", key: "observac", width: 20 }
    ];

    reporte.forEach((item) => {
      worksheet.addRow(item);
    });

    // Estilo encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.height = 22;

    headerRow.eachCell((cell: any) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00B050" }
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // Estilo celdas
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return;

      row.eachCell((cell: any) => {
        cell.alignment = {
          vertical: "top",
          horizontal: "left",
          wrapText: true
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });

      row.height = 35;
    });

    // Centrar algunas columnas
    const columnasCentradas = ["A", "F", "H", "I"];
    columnasCentradas.forEach((col) => {
      worksheet.getColumn(col).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
      };
    });

    // Filtro automático
    worksheet.autoFilter = {
      from: "A1",
      to: "I1"
    };

    // Congelar encabezado
    worksheet.views = [
      { state: "frozen", ySplit: 1 }
    ];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_iniciativas.xlsx"'
    );

    await workbook.xlsx.write(res);
    return res.end();

  } catch (error: any) {
    console.error("Error al generar Excel de iniciativas:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

const deduplicarPorId = (items: any[]) => {
  return items.filter(
    (e: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.id === e.id)
  );
};

const getPresentantesDePunto = async (id_punto: string | null | undefined) => {
  let proponentesString = "";
  let presentaString = "";

  if (!id_punto) {
    return { proponentesString, presentaString };
  }

  const presentan = await PuntosPresenta.findAll({
    where: { id_punto },
    include: [
      {
        model: Proponentes,
        as: "tipo_presenta",
        attributes: ["valor"]
      }
    ]
  });

  const proponentesUnicos = new Map<string, string>();
  const presentanData: any[] = [];

  for (const p of presentan as any[]) {
    const tipoValor = p.tipo_presenta?.valor ?? "";
    let valor = "";

    if (tipoValor === "Diputadas y Diputados") {
      const dip = await Diputado.findOne({ where: { id: p.id_presenta } });
      valor = `${dip?.apaterno ?? ""} ${dip?.amaterno ?? ""} ${dip?.nombres ?? ""}`.trim();

    } else if (
      ["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)
    ) {
      const comi = await Comision.findOne({ where: { id: p.id_presenta } });
      valor = comi?.nombre ?? "";

    } else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
      const muni = await MunicipiosAg.findOne({ where: { id: p.id_presenta } });
      valor = muni?.nombre ?? "";

    } else if (tipoValor === "Grupo Parlamentario") {
      const partido = await Partidos.findOne({ where: { id: p.id_presenta } });
      valor = partido?.nombre ?? "";

    } else if (tipoValor === "Legislatura") {
      const leg = await Legislatura.findOne({ where: { id: p.id_presenta } });
      valor = leg?.numero ?? "";

    } else if (tipoValor === "Secretarías del GEM") {
      const sec = await Secretarias.findOne({ where: { id: p.id_presenta } });
      valor = `${sec?.nombre ?? ""} / ${sec?.titular ?? ""}`.trim();

    } else {
      const cat = await CatFunDep.findOne({ where: { id: p.id_presenta } });
      valor = cat?.nombre_titular ?? "";
    }

    if (tipoValor && !proponentesUnicos.has(tipoValor)) {
      proponentesUnicos.set(tipoValor, tipoValor);
    }

    if (valor) {
      presentanData.push({
        proponente: tipoValor,
        valor,
        id_presenta: p.id_presenta
      });
    }
  }

  proponentesString = Array.from(proponentesUnicos.keys()).join(", ");
  presentaString = presentanData.map((p) => p.valor).join(", ");

  return { proponentesString, presentaString };
};

const formatearFechaCorta = (fecha: string): string => {
  if (!fecha) return "-";

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const date = new Date(fecha);

  const dia = String(date.getUTCDate()).padStart(2, "0");
  const mes = meses[date.getUTCMonth()];
  const anio = String(date.getUTCFullYear()).slice(-2);

  return `${dia}-${mes}-${anio}`;
};

const getAnfitriones = async (eventoId: string, tipoEventoNombre: string) => {
  if (!eventoId || tipoEventoNombre === "Sesión") {
    return { comisiones: null };
  }

  const anfitriones = await AnfitrionAgenda.findAll({
    where: { agenda_id: eventoId },
    attributes: ["autor_id"],
    raw: true
  });

  const comisionIds = anfitriones.map((a: any) => a.autor_id).filter(Boolean);

  if (comisionIds.length === 0) {
    return { comisiones: null };
  }

  const comisiones = await Comision.findAll({
    where: { id: comisionIds },
    attributes: ["nombre"],
    raw: true
  });

  return {
    comisiones: comisiones.map((c: any) => c.nombre).join(", ")
  };
};

const getComisionesTurnado = async (puntoId: string) => {
  if (!puntoId) {
    return { turnado: false, comisiones_turnado: null };
  }

  const puntosComisiones = await PuntosComisiones.findAll({
    where: { id_punto: puntoId },
    attributes: ["id_comision"],
    raw: true
  });

  if (puntosComisiones.length === 0) {
    return { turnado: false, comisiones_turnado: null };
  }

  const idsRaw = (puntosComisiones[0] as any).id_comision || "";

  const comisionIds = idsRaw
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);

  if (comisionIds.length === 0) {
    return { turnado: false, comisiones_turnado: null };
  }

  const comisiones = await Comision.findAll({
    where: { id: comisionIds },
    attributes: ["nombre"],
    raw: true
  });

  return {
    turnado: true,
    comisiones_turnado: comisiones.map((c: any) => c.nombre).join(", ")
  };
};