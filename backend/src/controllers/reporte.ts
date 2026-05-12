import { Request, Response } from "express";
import { Op } from "sequelize";
import PeriodoLegislativo from "../models/periodo_legislativo";
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
import IniciativasPresenta from "../models/iniciativaspresenta";
import ExpedienteEstudiosPuntos from "../models/expedientes_estudio_puntos";
import IntegranteLegislatura from "../models/integrante_legislaturas";

type ReporteBaseItem = {
  no: number;
  id: string;
  autor: string;
  autor_detalle: string;
  iniciativa: string;
  materia: string;
  presentac: string;
  fecha_evento_raw: string | null;
  comisiones: string;
  expedicion: string;
  observac: string;
  diputado: string;
  grupo_parlamentario: string;
  diputado_ids: string[];
  grupo_parlamentario_ids: string[];
  periodo: string;
  tipo: string | null;
  se_turna_comision: boolean;
};

const deduplicarPorId = (items: any[]) => {
  return items.filter(
    (e: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.id === e.id)
  );
};

const formatearFechaCorta = (fecha?: string | null): string => {
  if (!fecha) return "-";

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const date = new Date(fecha);

  const dia = String(date.getUTCDate()).padStart(2, "0");
  const mes = meses[date.getUTCMonth()];
  const anio = String(date.getUTCFullYear()).slice(-2);

  return `${dia}-${mes}-${anio}`;
};

const obtenerPeriodo = (fecha?: string | null): string => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${anio}-${mes}`;
};

const normalizarTexto = (valor: any): string => {
  if (!valor) return "-";
  return String(valor).trim() || "-";
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

  const todosIds = puntosComisiones
    .map((item: any) => item.id_comision || "")
    .join(",");

  const comisionIds = todosIds
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);

  const comisionIdsUnicos = [...new Set(comisionIds)];

  if (comisionIdsUnicos.length === 0) {
    return { turnado: false, comisiones_turnado: null };
  }

  const comisiones = await Comision.findAll({
    where: { id: comisionIdsUnicos },
    attributes: ["nombre"],
    raw: true
  });

  return {
    turnado: true,
    comisiones_turnado: comisiones.map((c: any) => c.nombre).join(", ")
  };
};

const getPresentantesDePunto = async (id: string | null | undefined) => {
  let proponentesString = "";
  let presentaString = "";

  const diputados: string[] = [];
  const diputadoIds: string[] = [];

  const gruposParlamentarios: string[] = [];
  const grupoParlamentarioIds: string[] = [];

  if (!id) {
    return {
      proponentesString,
      presentaString,
      diputados,
      diputadoIds,
      gruposParlamentarios,
      grupoParlamentarioIds
    };
  }

  const presentan = await IniciativasPresenta.findAll({
    where: { id_iniciativa: id },
    raw: true
  });

  const proponentesUnicos = new Map<string, string>();
  const presentanData: any[] = [];

  for (const p of presentan as any[]) {
    const tipoProponente: any = await Proponentes.findOne({
      where: { id: p.id_tipo_presenta },
      attributes: ["id", "valor"],
      raw: true
    });

    const tipoValor = tipoProponente?.valor ?? "";
    let valor = "";

    if (tipoValor === "Diputadas y Diputados") {
      const dip: any = await Diputado.findOne({
        where: { id: p.id_presenta },
        raw: true,
        include: [
          {
            model: IntegranteLegislatura,
            as: "integrante",
          }
        ]
      });

      if (dip) {
        valor = `${dip.apaterno ?? ""} ${dip.amaterno ?? ""} ${dip.nombres ?? ""}`.trim();

        if (valor) diputados.push(valor);
        if (p.id_presenta) diputadoIds.push(String(p.id_presenta));

        if (dip.integrante) {
          const partido: any = await Partidos.findOne({
            where: { id: dip.integrante.partido_id },
            attributes: ["id", "nombre"],
            raw: true
          });

          if (partido?.nombre) gruposParlamentarios.push(partido.nombre);
          if (partido?.id) grupoParlamentarioIds.push(String(partido.id));
        }
      }
    } else if (
      ["Mesa Directiva en turno", "Junta de Coordinación Politica", "Comisiones Legislativas", "Diputación Permanente"].includes(tipoValor)
    ) {
      const comi: any = await Comision.findOne({ where: { id: p.id_presenta }, raw: true });
      valor = comi?.nombre ?? "";
    } else if (["Ayuntamientos", "Municipios", "AYTO"].includes(tipoValor)) {
      const muni: any = await MunicipiosAg.findOne({ where: { id: p.id_presenta }, raw: true });
      valor = muni?.nombre ?? "";
    } else if (tipoValor === "Grupo Parlamentario") {
      const partido: any = await Partidos.findOne({
        where: { id: p.id_presenta },
        attributes: ["id", "nombre"],
        raw: true
      });

      valor = partido?.nombre ?? "";

      if (valor) gruposParlamentarios.push(valor);
      if (partido?.id) grupoParlamentarioIds.push(String(partido.id));
    } else if (tipoValor === "Legislatura") {
      const leg: any = await Legislatura.findOne({ where: { id: p.id_presenta }, raw: true });
      valor = leg?.numero ?? "";
    } else if (tipoValor === "Secretarías del GEM") {
      const sec: any = await Secretarias.findOne({ where: { id: p.id_presenta }, raw: true });
      valor = `${sec?.nombre ?? ""} / ${sec?.titular ?? ""}`.trim();
    } else {
      const cat: any = await CatFunDep.findOne({ where: { id: p.id_presenta }, raw: true });
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

  return {
    proponentesString,
    presentaString,
    diputados: [...new Set(diputados)],
    diputadoIds: [...new Set(diputadoIds)],
    gruposParlamentarios: [...new Set(gruposParlamentarios)],
    grupoParlamentarioIds: [...new Set(grupoParlamentarioIds)]
  };
};

const obtenerIniciativasBase = async () => {
  return await IniciativaPuntoOrden.findAll({
    attributes: ["id", "iniciativa", "createdAt", "id_punto", "expediente", "precluida", "tipo"],
    include: [
      {
        model: PuntosOrden,
        as: "punto",
        attributes: ["id", "punto", "nopunto", "tribuna", "dispensa", "se_turna_comision"],
        include: [
          {
            model: IniciativaEstudio,
            as: "estudio",
            attributes: ["id", "status", "createdAt", "punto_origen_id", "punto_destino_id", "type"],
            required: false,
            where: { type: 1 },
            include: [
              {
                model: PuntosOrden,
                as: "iniciativa",
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
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
                attributes: ["id", "punto", "nopunto", "tribuna", "dispensa"],
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
};

const construirReporteBase = async (): Promise<ReporteBaseItem[]> => {
  const iniciativas = await obtenerIniciativasBase();

 

  const reporte = await Promise.all(
    iniciativas.map(async (iniciativa, index) => {
      const data: any = iniciativa.toJSON();

      const {
        proponentesString,
        presentaString,
        diputados,
        diputadoIds,
        gruposParlamentarios,
        grupoParlamentarioIds
      } = await getPresentantesDePunto(data.id);

      const todosEstudios = [
        ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
        ...(Array.isArray(data.expedienteturno)
          ? data.expedienteturno.flatMap((exp: any) =>
              Array.isArray(exp.estudio)
                ? exp.estudio
                : exp.estudio
                ? [exp.estudio]
                : []
            )
          : [])
      ];

      const fuenteEstudios = deduplicarPorId(todosEstudios);

      const estudios = fuenteEstudios.filter((e: any) => e.status === "1");
      const dictamenes = fuenteEstudios.filter((e: any) => e.status === "2");
      const rechazadocomi = fuenteEstudios.filter((e: any) => e.status === "4");
      const rechazosesion = fuenteEstudios.filter((e: any) => e.status === "5");

      const dispensa = String(data.punto?.dispensa) === "1";
      const precluida = String(data.precluida) === "1";

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
        attributes: ["id", "expediente_id", "punto_origen_sesion_id"],
        raw: true
      });

      const expedienteIds = [
        ...new Set(
          expedientesRelacionados
            .map((e: any) => e.expediente_id)
            .filter(Boolean)
        )
      ];

      const whereCierres: any = {
        status: "3"
      };

      if (posiblesPuntosUnicos.length > 0 || expedienteIds.length > 0) {
        whereCierres[Op.or] = [];

        if (posiblesPuntosUnicos.length > 0) {
          whereCierres[Op.or].push({
            punto_origen_id: {
              [Op.in]: posiblesPuntosUnicos
            }
          });
        }

        if (expedienteIds.length > 0) {
          whereCierres[Op.or].push({
            punto_origen_id: {
              [Op.in]: expedienteIds
            }
          });
        }
      }

      const cierresDB =
        whereCierres[Op.or]?.length > 0
          ? await IniciativaEstudio.findAll({
              where: whereCierres,
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
            })
          : [];

      const cierresMerge = [
        ...fuenteEstudios.filter((e: any) => e.status === "3"),
        ...cierresDB.map((c: any) => c.toJSON())
      ];

      const cierres = deduplicarPorId(cierresMerge);
      const cierrePrincipal = cierres.length > 0 ? cierres[0] : null;

      let observacion = "En estudio";

      if (precluida) {
        observacion = "Precluida";
      } else if (dispensa) {
        observacion = "Aprobada";
      } else {
        if (cierrePrincipal) {
          observacion = "Aprobada";
        } else if (rechazosesion.length > 0) {
          observacion = "Rechazada en sesión";
        } else if (rechazadocomi.length > 0) {
          observacion = "Rechazada en comisión";
        } else if (dictamenes.length > 0) {
          observacion = "En estudio";
        } else if (estudios.length > 0) {
          observacion = "En estudio";
        }
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

      const diputado =
        diputados.length > 0 ? diputados.join(", ") : "-";

      const grupoParlamentario =
        gruposParlamentarios.length > 0
          ? gruposParlamentarios.join(", ")
          : "-";

      const fechaEventoRaw = data.evento?.fecha ?? null;
      const tipoTexto = (tipo?: number) => {
        switch (tipo) {
          case 1: return "Iniciativa";
          case 2: return "Punto de acuerdo";
          case 3: return "Minuta";
          default: return "Desconocido";
        }
      };

      return {
        no: index + 1,
        id: normalizarTexto(data.id),
        autor: normalizarTexto(proponentesString),
        autor_detalle: normalizarTexto(presentaString),
        iniciativa: normalizarTexto(data.iniciativa),
        materia: normalizarTexto(data.punto?.punto),
        presentac: formatearFechaCorta(fechaEventoRaw),
        fecha_evento_raw: fechaEventoRaw,
        comisiones: normalizarTexto(
          turnadoInfo.comisiones_turnado || anfitrionesNacio.comisiones
        ),
        expedicion: fechaExpedicion,
        observac: observacion,
        diputado,
        grupo_parlamentario: grupoParlamentario,
        diputado_ids: diputadoIds,
        grupo_parlamentario_ids: grupoParlamentarioIds,
        periodo: obtenerPeriodo(fechaEventoRaw),

        // ✅ AQUÍ ESTÁ EL FIX
        tipo: tipoTexto(data.tipo ?? data.punto?.tipo),
        se_turna_comision: String(data.punto?.se_turna_comision) === "1" || data.punto?.se_turna_comision === true,
      };
    })
  );

  return reporte;
};

const aplicarEstiloHoja = (worksheet: any) => {
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

    row.height = 30;
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};

const enviarWorkbook = async (res: Response, workbook: any, nombreArchivo: string) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${nombreArchivo}"`
  );

  await workbook.xlsx.write(res);
  return res.end();
};

const generarExcelSimple = async (
  res: Response,
  nombreHoja: string,
  nombreArchivo: string,
  columnas: { header: string; key: string; width: number }[],
  data: any[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(nombreHoja);

  worksheet.columns = columnas;

  data.forEach((item, index) => {
    worksheet.addRow({
      ...item,
      no: index + 1
    });
  });

  aplicarEstiloHoja(worksheet);

  const ultimaColumna = String.fromCharCode(64 + columnas.length);
  worksheet.autoFilter = {
    from: "A1",
    to: `${ultimaColumna}1`
  };

  const columnasCentradas = ["A"];
  columnasCentradas.forEach((col) => {
    worksheet.getColumn(col).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true
    };
  });

  return await enviarWorkbook(res, workbook, nombreArchivo);
};

export const getifnini = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();

    return await generarExcelSimple(
      res,
      "Reporte Iniciativas",
      "reporte_iniciativas.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "ID", key: "id", width: 40 },
        { header: "AUTOR", key: "autor", width: 28 },
        { header: "PRESENTA", key: "autor_detalle", width: 35 },
        { header: "DIPUTADO", key: "diputado", width: 30 },
        { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
        { header: "INICIATIVA", key: "iniciativa", width: 55 },
        { header: "MATERIA", key: "materia", width: 45 },
        { header: "PRESENTAC.", key: "presentac", width: 15 },
        { header: "COMISIONES", key: "comisiones", width: 40 },
        { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
        { header: "OBSERVAC.", key: "observac", width: 20 },
        { header: "PERIODO", key: "periodo", width: 15 },
        { header: "TIPO", key: "tipo", width: 15 }
      ],
      reporte
    );
  } catch (error: any) {
    console.error("Error al generar Excel general de iniciativas:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getIniciativasEnEstudio = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    const filtrado = reporte.filter((item) => item.observac === "En estudio");

    return await generarExcelSimple(
      res,
      "En estudio",
      "reporte_iniciativas_en_estudio.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "ID", key: "id", width: 40 },
        { header: "AUTOR", key: "autor", width: 28 },
        { header: "PRESENTA", key: "autor_detalle", width: 35 },
        { header: "DIPUTADO", key: "diputado", width: 30 },
        { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
        { header: "INICIATIVA", key: "iniciativa", width: 55 },
        { header: "MATERIA", key: "materia", width: 45 },
        { header: "PRESENTAC.", key: "presentac", width: 15 },
        { header: "COMISIONES", key: "comisiones", width: 40 },
        { header: "OBSERVAC.", key: "observac", width: 20 },
        { header: "PERIODO", key: "periodo", width: 15 }
      ],
      filtrado
    );
  } catch (error: any) {
    console.error("Error al generar Excel de iniciativas en estudio:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getIniciativasAprobadas = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    const filtrado = reporte.filter((item) => item.observac === "Aprobada");

    return await generarExcelSimple(
      res,
      "Aprobadas",
      "reporte_iniciativas_aprobadas.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "ID", key: "id", width: 40 },
        { header: "AUTOR", key: "autor", width: 28 },
        { header: "PRESENTA", key: "autor_detalle", width: 35 },
        { header: "DIPUTADO", key: "diputado", width: 30 },
        { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
        { header: "INICIATIVA", key: "iniciativa", width: 55 },
        { header: "MATERIA", key: "materia", width: 45 },
        { header: "PRESENTAC.", key: "presentac", width: 15 },
        { header: "COMISIONES", key: "comisiones", width: 40 },
        { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
        { header: "OBSERVAC.", key: "observac", width: 20 },
        { header: "PERIODO", key: "periodo", width: 15 }
      ],
      filtrado
    );
  } catch (error: any) {
    console.error("Error al generar Excel de iniciativas aprobadas:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getIniciativasPorGrupoYDiputado = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
  
    const mapa = new Map<string, any>();

    for (const item of reporte) {
      const diputado = item.diputado || "-";
      const grupo = item.grupo_parlamentario || "-";
    
      // if (diputado  == '-' && grupo == '-'){
      //   console.log(reporte)
      //   return 500;
      // }
      const llave = `${diputado}__${grupo}`;

      if (!mapa.has(llave)) {
        mapa.set(llave, {
          diputado,
          grupo_parlamentario: grupo,
          pendientes: 0,
          en_estudio: 0,
          aprobadas: 0,
          total: 0
        });
      }

      const fila = mapa.get(llave);

      if (item.observac === "En estudio") {
        fila.en_estudio += 1;
      }

      if (item.observac === "Aprobada") {
        fila.aprobadas += 1;
      }

      if (item.observac === "Pendiente") {
        fila.pendientes += 1;
      }

      fila.total += 1;
    }

    const resultado = Array.from(mapa.values()).sort((a, b) => {
      if (a.grupo_parlamentario < b.grupo_parlamentario) return -1;
      if (a.grupo_parlamentario > b.grupo_parlamentario) return 1;
      if (a.diputado < b.diputado) return -1;
      if (a.diputado > b.diputado) return 1;
      return 0;
    });

      
    return await generarExcelSimple(
      res,
      "Grupo y Diputado",
      "reporte_iniciativas_grupo_diputado.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "DIPUTADO", key: "diputado", width: 35 },
        { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 30 },
        { header: "PENDIENTES", key: "pendientes", width: 15 },
        { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
        { header: "APROBADAS", key: "aprobadas", width: 15 },
        { header: "TOTAL", key: "total", width: 12 }
      ],
      resultado
    );
  } catch (error: any) {
    console.error("Error al generar Excel por grupo y diputado:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getTotalesPorPeriodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();

    const mapa = new Map<string, any>();

    for (const item of reporte) {
      const periodo = item.periodo || "-";

      if (!mapa.has(periodo)) {
        mapa.set(periodo, {
          periodo,
          pendientes: 0,
          en_estudio: 0,
          aprobadas: 0,
          total: 0
        });
      }

      const fila = mapa.get(periodo);
    

      if (item.observac === "En estudio") {
        fila.en_estudio += 1;
      }

      if (item.observac === "Aprobada") {
        fila.aprobadas += 1;
      }

      if (item.observac === "Pendiente") {
        fila.pendientes += 1;
      }

      fila.total += 1;
    }

    const resultado = Array.from(mapa.values()).sort((a, b) => {
      if (a.periodo < b.periodo) return -1;
      if (a.periodo > b.periodo) return 1;
      return 0;
    });

    return await generarExcelSimple(
      res,
      "Totales por periodo",
      "reporte_iniciativas_totales_periodo.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "PERIODO", key: "periodo", width: 18 },
        { header: "PENDIENTES", key: "pendientes", width: 15 },
        { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
        { header: "APROBADAS", key: "aprobadas", width: 15 },
        { header: "TOTAL", key: "total", width: 12 }
      ],
      resultado
    );
  } catch (error: any) {
    console.error("Error al generar Excel total por periodo:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// export const getReporteIniciativasIntegrantes = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { id_tipo, id } = req.body;

//     if (![1, 2, "1", "2"].includes(id_tipo)) {
//       return res.status(400).json({
//         message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)"
//       });
//     }

//     if (id === undefined || id === null || id === "") {
//       return res.status(400).json({
//         message: "El campo id es obligatorio. Usa 0 para traer todos."
//       });
//     }

//     const tipo = Number(id_tipo);
//     const filtroId = String(id);

//     let reporte = await construirReporteBase();

//     // id_tipo = 2 => Diputado
//     if (tipo === 2) {
//       if (filtroId !== "0") {
//         reporte = reporte.filter((item: any) =>
//           Array.isArray(item.diputado_ids) &&
//           item.diputado_ids.map(String).includes(filtroId)
//         );
//       }

//       const mapa = new Map<string, any>();

//       for (const item of reporte) {
//         const diputado = item.diputado || "-";

//         let diputadoIds = Array.isArray(item.diputado_ids) ? item.diputado_ids : [];
//         if (filtroId !== "0") {
//           diputadoIds = diputadoIds.filter((x: any) => String(x) === filtroId);
//         }

//         if (diputadoIds.length === 0) {
//           if (filtroId === "0") {
//             diputadoIds = ["0"];
//           } else {
//             continue;
//           }
//         }

//         for (const dipId of diputadoIds) {
//           const llave = String(dipId);

//           if (!mapa.has(llave)) {
//             mapa.set(llave, {
//               diputado_id: String(dipId),
//               diputado,
//               pendientes: 0,
//               en_estudio: 0,
//               dictaminadas: 0,
//               aprobadas: 0,
//               rechazadas_comision: 0,
//               rechazadas_sesion: 0,
//               total: 0
//             });
//           }

//           const fila = mapa.get(llave);

//           if (item.observac === "Pendiente") fila.pendientes += 1;
//           if (item.observac === "En estudio") fila.en_estudio += 1;
//           if (item.observac === "Dictaminada") fila.dictaminadas += 1;
//           if (item.observac === "Aprobada") fila.aprobadas += 1;
//           if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
//           if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;

//           fila.total += 1;
//         }
//       }

//       const resultado = Array.from(mapa.values()).sort((a, b) => {
//         if (a.diputado < b.diputado) return -1;
//         if (a.diputado > b.diputado) return 1;
//         return 0;
//       });

//       return await generarExcelSimple(
//         res,
//         "Reporte Diputados",
//         "reporte_iniciativas_diputados.xlsx",
//         [
//           { header: "NO.", key: "no", width: 8 },
//           { header: "ID DIPUTADO", key: "diputado_id", width: 18 },
//           { header: "DIPUTADO", key: "diputado", width: 35 },
//           { header: "PENDIENTES", key: "pendientes", width: 15 },
//           { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
//           { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
//           { header: "APROBADAS", key: "aprobadas", width: 15 },
//           { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
//           { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
//           { header: "TOTAL", key: "total", width: 12 }
//         ],
//         resultado
//       );
//     }

//     // id_tipo = 1 => Grupo Parlamentario
//     if (tipo === 1) {
//       if (filtroId !== "0") {
//         reporte = reporte.filter((item: any) =>
//           Array.isArray(item.grupo_parlamentario_ids) &&
//           item.grupo_parlamentario_ids.map(String).includes(filtroId)
//         );
//       }

//       const mapa = new Map<string, any>();

//       for (const item of reporte) {
//         const grupo = item.grupo_parlamentario || "-";

//         let grupoIds = Array.isArray(item.grupo_parlamentario_ids)
//           ? item.grupo_parlamentario_ids
//           : [];

//         if (filtroId !== "0") {
//           grupoIds = grupoIds.filter((x: any) => String(x) === filtroId);
//         }

//         if (grupoIds.length === 0) {
//           if (filtroId === "0") {
//             grupoIds = ["0"];
//           } else {
//             continue;
//           }
//         }

//         for (const grupoId of grupoIds) {
//           const llave = String(grupoId);

//           if (!mapa.has(llave)) {
//             mapa.set(llave, {
//               grupo_parlamentario_id: String(grupoId),
//               grupo_parlamentario: grupo,
//               pendientes: 0,
//               en_estudio: 0,
//               dictaminadas: 0,
//               aprobadas: 0,
//               rechazadas_comision: 0,
//               rechazadas_sesion: 0,
//               total: 0
//             });
//           }

//           const fila = mapa.get(llave);

//           if (item.observac === "Pendiente") fila.pendientes += 1;
//           if (item.observac === "En estudio") fila.en_estudio += 1;
//           if (item.observac === "Dictaminada") fila.dictaminadas += 1;
//           if (item.observac === "Aprobada") fila.aprobadas += 1;
//           if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
//           if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;

//           fila.total += 1;
//         }
//       }

//       const resultado = Array.from(mapa.values()).sort((a, b) => {
//         if (a.grupo_parlamentario < b.grupo_parlamentario) return -1;
//         if (a.grupo_parlamentario > b.grupo_parlamentario) return 1;
//         return 0;
//       });

//       return await generarExcelSimple(
//         res,
//         "Reporte Grupos",
//         "reporte_iniciativas_grupos_parlamentarios.xlsx",
//         [
//           { header: "NO.", key: "no", width: 8 },
//           { header: "ID GRUPO", key: "grupo_parlamentario_id", width: 18 },
//           { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 35 },
//           { header: "PENDIENTES", key: "pendientes", width: 15 },
//           { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
//           { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
//           { header: "APROBADAS", key: "aprobadas", width: 15 },
//           { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
//           { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
//           { header: "TOTAL", key: "total", width: 12 }
//         ],
//         resultado
//       );
//     }

//     return res.status(400).json({
//       message: "No se pudo procesar la solicitud"
//     });

//   } catch (error: any) {
//     console.error("Error al generar Excel de integrantes:", error);
//     return res.status(500).json({
//       message: "Error interno del servidor",
//       error: error.message
//     });
//   }
// };


export const getReporteIniciativasIntegrantes = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id_tipo, id } = req.body;

    if (![1, 2, "1", "2"].includes(id_tipo)) {
      return res.status(400).json({
        message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)"
      });
    }

    if (id === undefined || id === null || id === "") {
      return res.status(400).json({
        message: "El campo id es obligatorio. Usa 0 para traer todos."
      });
    }

    const tipo = Number(id_tipo);
    const filtroId = String(id);

    // AJUSTA ESTOS IDS SEGÚN TU CATÁLOGO proponentes
    const ID_TIPO_PRESENTA_DIPUTADO = 9;
    const ID_TIPO_PRESENTA_GRUPO = 19;

    let wherePresenta: any = {};

    if (tipo === 2) {
      // Diputado
      wherePresenta.id_tipo_presenta = ID_TIPO_PRESENTA_DIPUTADO;

      if (filtroId !== "0") {
        wherePresenta.id_presenta = filtroId;
      }
    }

    if (tipo === 1) {
      // Grupo Parlamentario
      wherePresenta.id_tipo_presenta = ID_TIPO_PRESENTA_GRUPO;

      if (filtroId !== "0") {
        wherePresenta.id_presenta = filtroId;
      }
    }

    const relaciones = await IniciativasPresenta.findAll({
      where: wherePresenta,
      attributes: ["id_iniciativa", "id_presenta"],
      raw: true
    });

    if (!relaciones.length) {
      return res.status(404).json({
        message: "No se encontraron iniciativas para el filtro enviado"
      });
    }

    const iniciativasIds = [...new Set(relaciones.map((r: any) => String(r.id_iniciativa)).filter(Boolean))];

    let reporte = await construirReporteBase();

    reporte = reporte.filter((item: any) => iniciativasIds.includes(String(item.id)));

    if (!reporte.length) {
      return res.status(404).json({
        message: "No se encontraron datos en el reporte base para esas iniciativas"
      });
    }

    // =========================
    // REPORTE POR DIPUTADO
    // =========================
    if (tipo === 2) {
      const diputadosIds = [...new Set(relaciones.map((r: any) => String(r.id_presenta)).filter(Boolean))];

      const diputadosDB = await Diputado.findAll({
        where: {
          id: {
            [Op.in]: diputadosIds
          }
        },
        attributes: ["id", "apaterno", "amaterno", "nombres"],
        raw: true
      });

      const diputadosMap = new Map<string, string>();

      for (const dip of diputadosDB as any[]) {
        const nombre = `${dip.apaterno ?? ""} ${dip.amaterno ?? ""} ${dip.nombres ?? ""}`.trim();
        diputadosMap.set(String(dip.id), nombre || "-");
      }

      const iniciativasPorDiputado = new Map<string, Set<string>>();

      for (const row of relaciones as any[]) {
        const dipId = String(row.id_presenta);
        const iniId = String(row.id_iniciativa);

        if (!iniciativasPorDiputado.has(dipId)) {
          iniciativasPorDiputado.set(dipId, new Set<string>());
        }

        iniciativasPorDiputado.get(dipId)!.add(iniId);
      }

      const resultado: any[] = [];

      for (const dipId of diputadosIds) {
        const iniciativasDelDip = iniciativasPorDiputado.get(dipId);

        if (!iniciativasDelDip || iniciativasDelDip.size === 0) {
          continue;
        }

        const itemsDip = reporte.filter((item: any) => iniciativasDelDip.has(String(item.id)));

        if (!itemsDip.length) {
          continue;
        }

        const fila = {
          diputado_id: dipId,
          diputado: diputadosMap.get(dipId) || "-",
          pendientes: 0,
          en_estudio: 0,
          dictaminadas: 0,
          aprobadas: 0,
          rechazadas_comision: 0,
          rechazadas_sesion: 0,
          total: 0
        };

        for (const item of itemsDip) {
          if (item.observac === "Pendiente") fila.pendientes += 1;
          if (item.observac === "En estudio") fila.en_estudio += 1;
          if (item.observac === "Dictaminada") fila.dictaminadas += 1;
          if (item.observac === "Aprobada") fila.aprobadas += 1;
          if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
          if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;
          fila.total += 1;
        }

        if (fila.diputado !== "-" && fila.total > 0) {
          resultado.push(fila);
        }
      }

      resultado.sort((a, b) => a.diputado.localeCompare(b.diputado));

      return await generarExcelSimple(
        res,
        "Reporte Diputados",
        "reporte_iniciativas_diputados.xlsx",
        [
          { header: "NO.", key: "no", width: 8 },
          { header: "ID DIPUTADO", key: "diputado_id", width: 18 },
          { header: "DIPUTADO", key: "diputado", width: 35 },
          { header: "PENDIENTES", key: "pendientes", width: 15 },
          { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
          { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
          { header: "APROBADAS", key: "aprobadas", width: 15 },
          { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
          { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
          { header: "TOTAL", key: "total", width: 12 }
        ],
        resultado
      );
    }

    // =========================
    // REPORTE POR GRUPO
    // =========================
    if (tipo === 1) {
      const gruposIds = [...new Set(relaciones.map((r: any) => String(r.id_presenta)).filter(Boolean))];

      const gruposDB = await Partidos.findAll({
        where: {
          id: {
            [Op.in]: gruposIds
          }
        },
        attributes: ["id", "nombre"],
        raw: true
      });

      const gruposMap = new Map<string, string>();

      for (const grupo of gruposDB as any[]) {
        gruposMap.set(String(grupo.id), grupo.nombre || "-");
      }

      const iniciativasPorGrupo = new Map<string, Set<string>>();

      for (const row of relaciones as any[]) {
        const grupoId = String(row.id_presenta);
        const iniId = String(row.id_iniciativa);

        if (!iniciativasPorGrupo.has(grupoId)) {
          iniciativasPorGrupo.set(grupoId, new Set<string>());
        }

        iniciativasPorGrupo.get(grupoId)!.add(iniId);
      }

      const resultado: any[] = [];

      for (const grupoId of gruposIds) {
        const iniciativasDelGrupo = iniciativasPorGrupo.get(grupoId);

        if (!iniciativasDelGrupo || iniciativasDelGrupo.size === 0) {
          continue;
        }

        const itemsGrupo = reporte.filter((item: any) => iniciativasDelGrupo.has(String(item.id)));

        if (!itemsGrupo.length) {
          continue;
        }

        const fila = {
          grupo_parlamentario_id: grupoId,
          grupo_parlamentario: gruposMap.get(grupoId) || "-",
          pendientes: 0,
          en_estudio: 0,
          dictaminadas: 0,
          aprobadas: 0,
          rechazadas_comision: 0,
          rechazadas_sesion: 0,
          total: 0
        };

        for (const item of itemsGrupo) {
          if (item.observac === "Pendiente") fila.pendientes += 1;
          if (item.observac === "En estudio") fila.en_estudio += 1;
          if (item.observac === "Dictaminada") fila.dictaminadas += 1;
          if (item.observac === "Aprobada") fila.aprobadas += 1;
          if (item.observac === "Rechazada en comisión") fila.rechazadas_comision += 1;
          if (item.observac === "Rechazada en sesión") fila.rechazadas_sesion += 1;
          fila.total += 1;
        }

        if (fila.grupo_parlamentario !== "-" && fila.total > 0) {
          resultado.push(fila);
        }
      }

      resultado.sort((a, b) => a.grupo_parlamentario.localeCompare(b.grupo_parlamentario));

      return await generarExcelSimple(
        res,
        "Reporte Grupos",
        "reporte_iniciativas_grupos_parlamentarios.xlsx",
        [
          { header: "NO.", key: "no", width: 8 },
          { header: "ID GRUPO", key: "grupo_parlamentario_id", width: 18 },
          { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 35 },
          { header: "PENDIENTES", key: "pendientes", width: 15 },
          { header: "EN ESTUDIO", key: "en_estudio", width: 15 },
          { header: "DICTAMINADAS", key: "dictaminadas", width: 15 },
          { header: "APROBADAS", key: "aprobadas", width: 15 },
          { header: "RECH. COMISIÓN", key: "rechazadas_comision", width: 18 },
          { header: "RECH. SESIÓN", key: "rechazadas_sesion", width: 18 },
          { header: "TOTAL", key: "total", width: 12 }
        ],
        resultado
      );
    }

    return res.status(400).json({
      message: "No se pudo procesar la solicitud"
    });

  } catch (error: any) {
    console.error("Error al generar Excel de integrantes:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getPeriodosLegislativos = async (_req: Request, res: Response): Promise<any> => {
  try {
    const periodos = await PeriodoLegislativo.findAll({
      order: [["fecha_inicio", "DESC"]],
      raw: true
    });
    return res.json({ data: periodos });
  } catch (error: any) {
    console.error("Error al obtener periodos legislativos:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export const crearPeriodoLegislativo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, anio_legislativo, fecha_inicio, fecha_termino, tipo } = req.body;

    if (!nombre || !fecha_inicio || !fecha_termino || !tipo) {
      return res.status(400).json({ message: "Faltan campos requeridos: nombre, fecha_inicio, fecha_termino, tipo" });
    }

    if (![1, 2].includes(Number(tipo))) {
      return res.status(400).json({ message: "tipo debe ser 1 (ordinario) o 2 (extraordinario)" });
    }

    if (new Date(fecha_inicio) > new Date(fecha_termino)) {
      return res.status(400).json({ message: "fecha_inicio no puede ser mayor que fecha_termino" });
    }

    const periodo = await PeriodoLegislativo.create({
      nombre,
      anio_legislativo: anio_legislativo || null,
      fecha_inicio,
      fecha_termino,
      tipo
    });

    return res.status(201).json({ data: periodo });
  } catch (error: any) {
    console.error("Error al crear periodo legislativo:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export const getReportePorPeriodoLegislativo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { periodo_id } = req.body;

    if (!periodo_id) {
      return res.status(400).json({ message: "periodo_id es requerido" });
    }

    const periodo = await PeriodoLegislativo.findOne({
      where: { id: periodo_id },
      raw: true
    }) as any;

    if (!periodo) {
      return res.status(404).json({ message: "Periodo legislativo no encontrado" });
    }

    const reporte = await construirReporteBase();

    const fechaInicio = new Date(periodo.fecha_inicio + "T00:00:00Z");
    const fechaTermino = new Date(periodo.fecha_termino + "T23:59:59Z");

    const filtrado = reporte.filter((item) => {
      if (!item.fecha_evento_raw) return false;
      const fechaEvento = new Date(item.fecha_evento_raw);
      return fechaEvento >= fechaInicio && fechaEvento <= fechaTermino;
    });

    const tipoPeriodo = periodo.tipo === 1 ? "Ordinario" : "Extraordinario";
    const nombreSeguro = periodo.nombre.replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ ]/g, "").trim();
    const nombreArchivo = `reporte_${tipoPeriodo.toLowerCase()}_${nombreSeguro.replace(/\s+/g, "_")}.xlsx`;

    return await generarExcelSimple(
      res,
      `${tipoPeriodo} - ${periodo.nombre}`,
      nombreArchivo,
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "ID", key: "id", width: 40 },
        { header: "AUTOR", key: "autor", width: 28 },
        { header: "PRESENTA", key: "autor_detalle", width: 35 },
        { header: "DIPUTADO", key: "diputado", width: 30 },
        { header: "GRUPO PARLAMENTARIO", key: "grupo_parlamentario", width: 25 },
        { header: "INICIATIVA", key: "iniciativa", width: 55 },
        { header: "MATERIA", key: "materia", width: 45 },
        { header: "PRESENTAC.", key: "presentac", width: 15 },
        { header: "COMISIONES", key: "comisiones", width: 40 },
        { header: "EXPEDICIÓN", key: "expedicion", width: 15 },
        { header: "OBSERVAC.", key: "observac", width: 20 },
        { header: "TIPO", key: "tipo", width: 15 }
      ],
      filtrado
    );
  } catch (error: any) {
    console.error("Error al generar reporte por periodo legislativo:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

export const getIniciativasTurnadasComision = async (_req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    const filtrado = reporte.filter((item) => item.se_turna_comision && item.comisiones && item.comisiones !== "-");

    const rows = filtrado.map((item) => ({
      comisiones: item.comisiones !== "-" ? item.comisiones.replace(/, /g, " / ") : "-",
      iniciativa: item.iniciativa,
      info: `${item.presentac} / ${item.autor_detalle} / ${item.observac}`
    }));

    return await generarExcelSimple(
      res,
      "Turnadas a Comisión",
      "reporte_turnadas_comision.xlsx",
      [
        { header: "NO.", key: "no", width: 8 },
        { header: "COMISIÓN(ES)", key: "comisiones", width: 55 },
        { header: "INICIATIVA", key: "iniciativa", width: 60 },
        { header: "INFO INICIATIVA", key: "info", width: 55 }
      ],
      rows
    );
  } catch (error: any) {
    console.error("Error al generar Excel de iniciativas turnadas a comisión:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};