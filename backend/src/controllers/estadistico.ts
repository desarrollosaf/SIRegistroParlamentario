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
import VotosPunto from "../models/votos_punto";
import TipoCargoComision from "../models/tipo_cargo_comisions";
import AsistenciaVoto from "../models/asistencia_votos";
import Sedes from "../models/sedes";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

type ReporteBaseItem = {
  no: number;
  id: string;
  tipo: number | string;
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
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PUROS (sin I/O)
// ─────────────────────────────────────────────────────────────────────────────

const deduplicarPorId = (items: any[]) =>
  items.filter(
    (e, idx, self) => idx === self.findIndex((x) => x.id === e.id)
  );

const formatearFechaCorta = (fecha?: string | null): string => {
  if (!fecha) return "-";
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const d = new Date(fecha);
  return `${String(d.getUTCDate()).padStart(2,"0")}-${meses[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(-2)}`;
};

const obtenerPeriodo = (fecha?: string | null): string => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,"0")}`;
};

const normalizarTexto = (valor: any): string =>
  valor ? String(valor).trim() || "-" : "-";

// ─────────────────────────────────────────────────────────────────────────────
// CARGA MASIVA DE CATÁLOGOS  (una sola vez, todo en paralelo)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve Maps indexados por ID para lookup O(1).
 * Esto reemplaza las decenas de findOne() individuales dentro del loop.
 */
const cargarCatalogos = async () => {
  const [
    diputados,
    integrantes,
    partidos,
    comisiones,
    municipios,
    secretarias,
    legislaturas,
    catFunDep,
    proponentes,
  ] = await Promise.all([
    Diputado.findAll({ raw: true }),
    IntegranteLegislatura.findAll({ raw: true }),
    Partidos.findAll({ attributes: ["id","nombre"], raw: true }),
    Comision.findAll({ attributes: ["id","nombre"], raw: true }),
    MunicipiosAg.findAll({ raw: true }),
    Secretarias.findAll({ raw: true }),
    Legislatura.findAll({ raw: true }),
    CatFunDep.findAll({ raw: true }),
    Proponentes.findAll({ attributes: ["id","valor"], raw: true }),
  ]);

  // Maps clave → objeto
  const mapDiputados    = new Map<string, any>(diputados.map((d: any) => [String(d.id), d]));
  const mapIntegrantes  = new Map<string, any>(integrantes.map((i: any) => [String(i.diputado_id ?? i.id), i]));
  const mapPartidos     = new Map<string, any>(partidos.map((p: any) => [String(p.id), p]));
  const mapComisiones   = new Map<string, any>(comisiones.map((c: any) => [String(c.id), c]));
  const mapMunicipios   = new Map<string, any>(municipios.map((m: any) => [String(m.id), m]));
  const mapSecretarias  = new Map<string, any>(secretarias.map((s: any) => [String(s.id), s]));
  const mapLegislaturas = new Map<string, any>(legislaturas.map((l: any) => [String(l.id), l]));
  const mapCatFunDep    = new Map<string, any>(catFunDep.map((c: any) => [String(c.id), c]));
  const mapProponentes  = new Map<string, any>(proponentes.map((p: any) => [String(p.id), p]));

  return {
    mapDiputados,
    mapIntegrantes,
    mapPartidos,
    mapComisiones,
    mapMunicipios,
    mapSecretarias,
    mapLegislaturas,
    mapCatFunDep,
    mapProponentes,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PRESENTANTES  (ya sin queries — usa Maps)
// ─────────────────────────────────────────────────────────────────────────────

const getPresentantesDePunto = (
  presentanRows: any[],           // filas de IniciativasPresenta para este id_iniciativa
  catalogos: Awaited<ReturnType<typeof cargarCatalogos>>
) => {
  const {
    mapDiputados,
    mapIntegrantes,
    mapPartidos,
    mapComisiones,
    mapMunicipios,
    mapSecretarias,
    mapLegislaturas,
    mapCatFunDep,
    mapProponentes,
  } = catalogos;

  const proponentesUnicos = new Map<string,string>();
  const presentaData: string[] = [];
  const diputados: string[] = [];
  const diputadoIds: string[] = [];
  const gruposParlamentarios: string[] = [];
  const grupoParlamentarioIds: string[] = [];

  for (const p of presentanRows) {
    const tipo = mapProponentes.get(String(p.id_tipo_presenta));
    const tipoValor: string = tipo?.valor ?? "";
    let valor = "";

    if (tipoValor === "Diputadas y Diputados") {
      const dip = mapDiputados.get(String(p.id_presenta));
      if (dip) {
        valor = `${dip.apaterno ?? ""} ${dip.amaterno ?? ""} ${dip.nombres ?? ""}`.trim();
        if (valor) diputados.push(valor);
        if (p.id_presenta) diputadoIds.push(String(p.id_presenta));

        // El integrante puede estar indexado por diputado_id o directamente por id
        const integrante = mapIntegrantes.get(String(dip.id));
        if (integrante) {
          const partido = mapPartidos.get(String(integrante.partido_id));
          if (partido?.nombre) gruposParlamentarios.push(partido.nombre);
          if (partido?.id)     grupoParlamentarioIds.push(String(partido.id));
        }
      }
    } else if (
      ["Mesa Directiva en turno","Junta de Coordinación Politica","Comisiones Legislativas","Diputación Permanente"].includes(tipoValor)
    ) {
      valor = mapComisiones.get(String(p.id_presenta))?.nombre ?? "";
    } else if (["Ayuntamientos","Municipios","AYTO"].includes(tipoValor)) {
      valor = mapMunicipios.get(String(p.id_presenta))?.nombre ?? "";
    } else if (tipoValor === "Grupo Parlamentario") {
      const partido = mapPartidos.get(String(p.id_presenta));
      valor = partido?.nombre ?? "";
      if (valor)     gruposParlamentarios.push(valor);
      if (partido?.id) grupoParlamentarioIds.push(String(partido.id));
    } else if (tipoValor === "Legislatura") {
      valor = String(mapLegislaturas.get(String(p.id_presenta))?.numero ?? "");
    } else if (tipoValor === "Secretarías del GEM") {
      const sec = mapSecretarias.get(String(p.id_presenta));
      valor = sec ? `${sec.nombre ?? ""} / ${sec.titular ?? ""}`.trim() : "";
    } else {
      valor = mapCatFunDep.get(String(p.id_presenta))?.nombre_titular ?? "";
    }

    if (tipoValor && !proponentesUnicos.has(tipoValor)) proponentesUnicos.set(tipoValor, tipoValor);
    if (valor) presentaData.push(valor);
  }

  return {
    proponentesString:    [...proponentesUnicos.keys()].join(", "),
    presentaString:       presentaData.join(", "),
    diputados:            [...new Set(diputados)],
    diputadoIds:          [...new Set(diputadoIds)],
    gruposParlamentarios: [...new Set(gruposParlamentarios)],
    grupoParlamentarioIds:[...new Set(grupoParlamentarioIds)],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERY BASE DE INICIATIVAS  (igual que antes — el ORM ya hace sus joins)
// ─────────────────────────────────────────────────────────────────────────────

const obtenerIniciativasBase = async () =>
  IniciativaPuntoOrden.findAll({
    attributes: ["id","iniciativa","createdAt","id_punto","expediente","precluida","tipo"],
    include: [
      {
        model: PuntosOrden, as: "punto",
        attributes: ["id","punto","nopunto","tribuna","dispensa"],
        include: [{
          model: IniciativaEstudio, as: "estudio",
          attributes: ["id","status","createdAt","punto_origen_id","punto_destino_id","type"],
          required: false, where: { type: 1 },
          include: [{
            model: PuntosOrden, as: "iniciativa",
            attributes: ["id","punto","nopunto","tribuna","dispensa"],
            include: [{
              model: Agenda, as: "evento",
              attributes: ["id","fecha","descripcion","liga"],
              include: [{ model: TipoEventos, as: "tipoevento", attributes: ["nombre"] }]
            }]
          }]
        }]
      },
      {
        model: ExpedienteEstudiosPuntos, as: "expedienteturno",
        attributes: ["id","expediente_id","punto_origen_sesion_id"],
        include: [{
          model: IniciativaEstudio, as: "estudio",
          attributes: ["id","status","createdAt","punto_origen_id","punto_destino_id","type"],
          required: false,
          include: [{
            model: PuntosOrden, as: "iniciativa",
            attributes: ["id","punto","nopunto","tribuna","dispensa"],
            include: [{
              model: Agenda, as: "evento",
              attributes: ["id","fecha","descripcion","liga"],
              include: [{ model: TipoEventos, as: "tipoevento", attributes: ["nombre"] }]
            }]
          }]
        }]
      },
      {
        model: Agenda, as: "evento",
        attributes: ["id","fecha","descripcion","liga"],
        include: [{ model: TipoEventos, as: "tipoevento", attributes: ["nombre"] }]
      }
    ],
    where: { publico: 1 },
    order: [["createdAt","ASC"]]
  });

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL REPORTE  (N+1 eliminado)
// ─────────────────────────────────────────────────────────────────────────────

const construirReporteBase = async (): Promise<ReporteBaseItem[]> => {
  // 1) Todas las queries en paralelo — catálogos + iniciativas + relaciones auxiliares
  const [iniciativasRaw, catalogos, todasPresentan, todosAnfitriones, todosPuntosComisiones] =
    await Promise.all([
      obtenerIniciativasBase(),
      cargarCatalogos(),
      IniciativasPresenta.findAll({ raw: true }),
      AnfitrionAgenda.findAll({ attributes: ["agenda_id","autor_id"], raw: true }),
      PuntosComisiones.findAll({ attributes: ["id_punto","id_comision"], raw: true }),
    ]);

  // 2) Agrupar presentantes por id_iniciativa  → Map<iniciativaId, rows[]>
  const presentanPorIniciativa = new Map<string, any[]>();
  for (const row of todasPresentan as any[]) {
    const key = String(row.id_iniciativa);
    if (!presentanPorIniciativa.has(key)) presentanPorIniciativa.set(key, []);
    presentanPorIniciativa.get(key)!.push(row);
  }

  // 3) Anfitriones por agenda_id → Map<agendaId, nombre[]>
  const anfitrionesMap = new Map<string, string[]>();
  const { mapComisiones } = catalogos;
  for (const a of todosAnfitriones as any[]) {
    const key = String(a.agenda_id);
    if (!anfitrionesMap.has(key)) anfitrionesMap.set(key, []);
    const nombre = mapComisiones.get(String(a.autor_id))?.nombre;
    if (nombre) anfitrionesMap.get(key)!.push(nombre);
  }

  // 4) Comisiones turnadas por punto_id → Map<puntoId, nombre[]>
  const comisionesTurnadoMap = new Map<string, string[]>();
  for (const row of todosPuntosComisiones as any[]) {
    const key = String(row.id_punto);
    const ids = String(row.id_comision ?? "")
      .replace(/[\[\]]/g, "").split(",")
      .map((x: string) => x.trim()).filter(Boolean);
    if (!comisionesTurnadoMap.has(key)) comisionesTurnadoMap.set(key, []);
    for (const cid of ids) {
      const nombre = mapComisiones.get(cid)?.nombre;
      if (nombre) comisionesTurnadoMap.get(key)!.push(nombre);
    }
  }

  // 5) Reunir todos los punto_ids y expediente_ids para resolver cierres en batch
  const iniciativas = iniciativasRaw.map((i) => (i as any).toJSON());

  const todosLosPuntoIds = new Set<string>();
  const todosLosExpedienteIds = new Set<string>();

  for (const data of iniciativas) {
    if (data.punto?.id) todosLosPuntoIds.add(String(data.punto.id));
    const estudios = [
      ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
      ...(Array.isArray(data.expedienteturno)
        ? data.expedienteturno.flatMap((exp: any) =>
            Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : []
          )
        : [])
    ];
    for (const e of deduplicarPorId(estudios)) {
      if (e.punto_destino_id) todosLosPuntoIds.add(String(e.punto_destino_id));
    }
  }

  // Batch: expedientes relacionados a todos los puntos de una sola vez
  const expRelacionados = todosLosPuntoIds.size > 0
    ? await ExpedienteEstudiosPuntos.findAll({
        where: { punto_origen_sesion_id: { [Op.in]: [...todosLosPuntoIds] } },
        attributes: ["id","expediente_id","punto_origen_sesion_id"],
        raw: true
      })
    : [];

  // Map: punto_id → expediente_ids[]
  const expedientesPorPunto = new Map<string, string[]>();
  for (const e of expRelacionados as any[]) {
    const key = String(e.punto_origen_sesion_id);
    if (!expedientesPorPunto.has(key)) expedientesPorPunto.set(key, []);
    if (e.expediente_id) expedientesPorPunto.get(key)!.push(String(e.expediente_id));
  }
  for (const eid of expRelacionados as any[]) {
    if (eid.expediente_id) todosLosExpedienteIds.add(String(eid.expediente_id));
  }

  // Batch: todos los cierres (status=3) de una sola vez
  const cierresOrWhere: any[] = [];
  if (todosLosPuntoIds.size > 0)
    cierresOrWhere.push({ punto_origen_id: { [Op.in]: [...todosLosPuntoIds] } });
  if (todosLosExpedienteIds.size > 0)
    cierresOrWhere.push({ punto_origen_id: { [Op.in]: [...todosLosExpedienteIds] } });

  const cierresDB = cierresOrWhere.length > 0
    ? await IniciativaEstudio.findAll({
        where: { status: "3", [Op.or]: cierresOrWhere },
        include: [{
          model: PuntosOrden, as: "iniciativa",
          attributes: ["id","punto","nopunto","tribuna"],
          include: [{
            model: Agenda, as: "evento",
            attributes: ["id","fecha","descripcion","liga"],
            include: [{ model: TipoEventos, as: "tipoevento", attributes: ["nombre"] }]
          }]
        }]
      })
    : [];

  // Map: punto_origen_id → cierre
  const cierresPorPunto = new Map<string, any>();
  for (const c of cierresDB as any[]) {
    const cd = typeof c.toJSON === "function" ? c.toJSON() : c;
    if (!cierresPorPunto.has(String(cd.punto_origen_id)))
      cierresPorPunto.set(String(cd.punto_origen_id), cd);
  }

  // 6) Construir el reporte — solo JS, cero queries adicionales
  return iniciativas.map((data, index) => {
    const presentanRows = presentanPorIniciativa.get(String(data.id)) ?? [];
    const {
      proponentesString, presentaString,
      diputados, diputadoIds,
      gruposParlamentarios, grupoParlamentarioIds,
    } = getPresentantesDePunto(presentanRows, catalogos);

    const todosEstudios = [
      ...(Array.isArray(data.punto?.estudio) ? data.punto.estudio : []),
      ...(Array.isArray(data.expedienteturno)
        ? data.expedienteturno.flatMap((exp: any) =>
            Array.isArray(exp.estudio) ? exp.estudio : exp.estudio ? [exp.estudio] : []
          )
        : [])
    ];
    const fuenteEstudios = deduplicarPorId(todosEstudios);

    const estudios      = fuenteEstudios.filter((e: any) => e.status === "1");
    const dictamenes    = fuenteEstudios.filter((e: any) => e.status === "2");
    const rechazadocomi = fuenteEstudios.filter((e: any) => e.status === "4");
    const rechazosesion = fuenteEstudios.filter((e: any) => e.status === "5");
    const dispensa  = String(data.punto?.dispensa) === "1";
    const precluida = String(data.precluida) === "1";

    // Resolver cierre usando el Map precargado
    const posiblesPuntosIds = [
      data.punto?.id,
      ...fuenteEstudios.map((e: any) => e.punto_destino_id).filter(Boolean)
    ].filter(Boolean).map(String);

    let cierrePrincipal: any = null;
    for (const pid of posiblesPuntosIds) {
      if (cierresPorPunto.has(pid)) { cierrePrincipal = cierresPorPunto.get(pid); break; }
    }
    // También buscar por expediente_id si aplica
    if (!cierrePrincipal) {
      for (const pid of posiblesPuntosIds) {
        const expIds = expedientesPorPunto.get(pid) ?? [];
        for (const eid of expIds) {
          if (cierresPorPunto.has(eid)) { cierrePrincipal = cierresPorPunto.get(eid); break; }
        }
        if (cierrePrincipal) break;
      }
    }

    let observacion = "En estudio";
    if (precluida) {
      observacion = "Precluida";
    } else if (dispensa) {
      observacion = "Aprobada";
    } else if (cierrePrincipal) {
      observacion = "Aprobada";
    } else if (rechazosesion.length > 0) {
      observacion = "Rechazada en sesión";
    } else if (rechazadocomi.length > 0) {
      observacion = "Rechazada en comisión";
    } else if (dictamenes.length > 0 || estudios.length > 0) {
      observacion = "En estudio";
    }

    // Comisiones turnadas (lookup O(1))
    const puntoId = data.punto?.id ? String(data.punto.id) : null;
    const comisionesTurnado = puntoId
      ? [...new Set(comisionesTurnadoMap.get(puntoId) ?? [])].join(", ")
      : null;

    // Anfitriones (solo si no es Sesión)
    const tipoNombre = data.evento?.tipoevento?.nombre ?? "";
    const comisionesAnfitrion = tipoNombre !== "Sesión" && data.evento?.id
      ? [...new Set(anfitrionesMap.get(String(data.evento.id)) ?? [])].join(", ")
      : null;

    const fechaEventoRaw = data.evento?.fecha ?? null;

    const fechaExpedicion = cierrePrincipal?.iniciativa?.evento?.fecha
      ? formatearFechaCorta(cierrePrincipal.iniciativa.evento.fecha)
      : "-";

    return {
      no: index + 1,
      id:                     normalizarTexto(data.id),
      tipo:                   Number(data.tipo ?? 0),
      autor:                  normalizarTexto(proponentesString),
      autor_detalle:          normalizarTexto(presentaString),
      iniciativa:             normalizarTexto(data.iniciativa),
      materia:                normalizarTexto(data.punto?.punto),
      presentac:              formatearFechaCorta(fechaEventoRaw),
      fecha_evento_raw:       fechaEventoRaw,
      comisiones:             normalizarTexto(comisionesTurnado || comisionesAnfitrion),
      expedicion:             fechaExpedicion,
      observac:               observacion,
      diputado:               diputados.length > 0 ? diputados.join(", ") : "-",
      grupo_parlamentario:    gruposParlamentarios.length > 0 ? gruposParlamentarios.join(", ") : "-",
      diputado_ids:           diputadoIds,
      grupo_parlamentario_ids: grupoParlamentarioIds,
      periodo:                obtenerPeriodo(fechaEventoRaw),
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL HELPER (sin cambios)
// ─────────────────────────────────────────────────────────────────────────────

const aplicarEstiloHoja = (worksheet: any) => {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell: any) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00B050" } };
    cell.border = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
  });
  worksheet.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return;
    row.eachCell((cell: any) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.border = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
    });
    row.height = 30;
  });
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};

const enviarWorkbook = async (res: Response, workbook: any, nombreArchivo: string) => {
  res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition",`attachment; filename="${nombreArchivo}"`);
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
  data.forEach((item, index) => worksheet.addRow({ ...item, no: index + 1 }));
  aplicarEstiloHoja(worksheet);
  const ultimaColumna = String.fromCharCode(64 + columnas.length);
  worksheet.autoFilter = { from: "A1", to: `${ultimaColumna}1` };
  worksheet.getColumn("A").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  return await enviarWorkbook(res, workbook, nombreArchivo);
};

const contarPorObservacion = (items: ReporteBaseItem[], obs: string) =>
  items.filter((i) => i.observac === obs).length;

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS  (idénticos externamente, internos usan el reporte optimizado)
// ─────────────────────────────────────────────────────────────────────────────

export const getResumenTotalesEndpoint = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte      = await construirReporteBase();
    const iniciativas  = reporte.filter((i) => Number(i.tipo) === 1);
    const puntosAcuerdo = reporte.filter((i) => Number(i.tipo) === 2);
    const minutas      = reporte.filter((i) => Number(i.tipo) === 3);

    return res.status(200).json({
      ok: true,
      data: {
        iniciativas: {
          en_estudio: contarPorObservacion(iniciativas, "En estudio"),
          aprobadas:  contarPorObservacion(iniciativas, "Aprobada"),
          total:      iniciativas.length,
        },
        minutas: {
          aprobadas: contarPorObservacion(minutas, "Aprobada"),
          total:     minutas.length,
        },
        puntos_acuerdo: { total: puntosAcuerdo.length },
        totales_generales: {
          iniciativas:    iniciativas.length,
          minutas:        minutas.length,
          puntos_acuerdo: puntosAcuerdo.length,
          total_registros: reporte.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Error al generar resumen:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
  }
};

export const getIniciativasPresentadasPorDiputado = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id ?? req.query.id ?? req.body.id;
    if (!id) return res.status(400).json({ ok: false, message: "El id del diputado es obligatorio" });

    const diputadoId = String(id);
    const [diputadoRaw, reporte] = await Promise.all([
      Diputado.findOne({ where: { id: diputadoId }, include: [{ model: IntegranteLegislatura, as: "integrante" }] }),
      construirReporteBase(),
    ]);

    if (!diputadoRaw) return res.status(404).json({ ok: false, message: "Diputado no encontrado" });

    const diputado: any = diputadoRaw;
    const nombreDiputado = `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim();
    const grupoId = diputado.integrante?.partido_id ? String(diputado.integrante.partido_id) : null;

    let grupoNombre = "-";
    if (grupoId) {
      const partido: any = await Partidos.findOne({ where: { id: grupoId }, attributes: ["id","nombre"], raw: true });
      grupoNombre = partido?.nombre ?? "-";
    }

    const autorElla  = reporte.filter((i) => i.diputado_ids.map(String).includes(diputadoId));
    const autorGrupo = grupoId
      ? reporte.filter((i) => i.grupo_parlamentario_ids.map(String).includes(String(grupoId)))
      : [];

    const mapaGeneral = new Map<string,any>();
    [...autorElla, ...autorGrupo].forEach((i) => mapaGeneral.set(String(i.id), i));
    const totalGeneral = [...mapaGeneral.values()];

    const contarResumen = (items: any[]) => ({
      pendientes:          items.filter((x) => x.observac === "Pendiente").length,
      en_estudio:          items.filter((x) => x.observac === "En estudio").length,
      dictaminadas:        items.filter((x) => x.observac === "Dictaminada").length,
      aprobadas:           items.filter((x) => x.observac === "Aprobada").length,
      rechazadas_comision: items.filter((x) => x.observac === "Rechazada en comisión").length,
      rechazadas_sesion:   items.filter((x) => x.observac === "Rechazada en sesión").length,
      precluidas:          items.filter((x) => x.observac === "Precluida").length,
      total: items.length,
    });

    return res.status(200).json({
      ok: true,
      data: {
        diputado_id:          diputadoId,
        diputado:             nombreDiputado || "-",
        grupo_parlamentario_id: grupoId,
        grupo_parlamentario:  grupoNombre,
        resumen_general:      contarResumen(totalGeneral),
        autor_ella:  { resumen: contarResumen(autorElla),  data: autorElla  },
        autor_grupo: { resumen: contarResumen(autorGrupo), data: autorGrupo },
      },
    });
  } catch (error: any) {
    console.error("Error al obtener iniciativas por diputado:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
  }
};

export const getIniciativasTurnadasPorComision = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id ?? req.query.id ?? req.body.id;
    if (!id) return res.status(400).json({ ok: false, message: "El id de la comisión es obligatorio" });

    const comisionId = String(id).trim();

    const [comisionRaw, puntosComisiones, reporte] = await Promise.all([
      Comision.findOne({ where: { id: comisionId }, attributes: ["id","nombre"], raw: true }),
      PuntosComisiones.findAll({ attributes: ["id_punto","id_comision"], raw: true }),
      construirReporteBase(),
    ]);

    if (!comisionRaw) return res.status(404).json({ ok: false, message: "Comisión no encontrada" });
    const comision: any = comisionRaw;

    const puntosIds = [...new Set(
      (puntosComisiones as any[])
        .filter((row) =>
          String(row.id_comision ?? "").replace(/[\[\]]/g,"").split(",")
            .map((x: string) => x.trim()).includes(comisionId)
        )
        .map((row) => String(row.id_punto))
        .filter(Boolean)
    )];

    if (!puntosIds.length) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron iniciativas turnadas a esta comisión",
        data: { comision_id: comisionId, comision: comision.nombre, total: 0, iniciativas: [] },
      });
    }

    const iniciativasDB = await IniciativaPuntoOrden.findAll({
      where: { id_punto: { [Op.in]: puntosIds }, publico: 1 },
      attributes: ["id","id_punto"],
      raw: true,
    });

    const iniciativasIds = new Set(
      (iniciativasDB as any[]).map((r) => String(r.id)).filter(Boolean)
    );

    if (!iniciativasIds.size) {
      return res.status(404).json({
        ok: false,
        message: "Se encontraron puntos turnados, pero no iniciativas relacionadas",
        data: { comision_id: comisionId, comision: comision.nombre, total: 0, iniciativas: [] },
      });
    }

    const filtrado = reporte.filter((i) => iniciativasIds.has(String(i.id)));

    const resumen = {
      pendientes:          filtrado.filter((x) => x.observac === "Pendiente").length,
      en_estudio:          filtrado.filter((x) => x.observac === "En estudio").length,
      dictaminadas:        filtrado.filter((x) => x.observac === "Dictaminada").length,
      aprobadas:           filtrado.filter((x) => x.observac === "Aprobada").length,
      rechazadas_comision: filtrado.filter((x) => x.observac === "Rechazada en comisión").length,
      rechazadas_sesion:   filtrado.filter((x) => x.observac === "Rechazada en sesión").length,
      precluidas:          filtrado.filter((x) => x.observac === "Precluida").length,
      total: filtrado.length,
    };

    return res.status(200).json({
      ok: true,
      data: { comision_id: String(comision.id), comision: comision.nombre, total: filtrado.length, resumen, iniciativas: filtrado },
    });
  } catch (error: any) {
    console.error("Error al obtener iniciativas por comisión:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
  }
};


export const getEventosPorComision = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id ?? req.query.id ?? req.body.id;
    if (!id) return res.status(400).json({ ok: false, message: "El id de la comisión es obligatorio" });

    const comisionId = String(id).trim();

    
    const comisionRaw = await Comision.findOne({
      where: { id: comisionId },
      attributes: ["id", "nombre"],
      raw: true,
    });
    if (!comisionRaw)
      return res.status(404).json({ ok: false, message: "Comisión no encontrada" });
    const comision: any = comisionRaw;


    const anfitrionesRaw = await AnfitrionAgenda.findAll({
      where: { autor_id: comisionId },
      attributes: ["agenda_id", "autor_id"],
      raw: true,
    });

    if (!(anfitrionesRaw as any[]).length) {
      return res.status(200).json({
        ok: true,
        data: {
          comision_id: comisionId,
          comision:    comision.nombre,
          resumen: {
            total_eventos:       0,
            total_iniciativas:   0,
            total_votadas:       0,
            total_no_votadas:    0,
            aprobadas:           0,
            rechazadas_sesion:   0,
            rechazadas_comision: 0,
            en_estudio:          0,
          },
          eventos: [],
        },
      });
    }

    const agendaIds = [
      ...new Set((anfitrionesRaw as any[]).map((a) => String(a.agenda_id))),
    ];

    
    const todosAnfitrionesRaw = await AnfitrionAgenda.findAll({
      where: {
        agenda_id: { [Op.in]: agendaIds },
      },
      attributes: ["agenda_id", "autor_id", "tipo_autor_id"],
      raw: true,
      paranoid: false, // por si tiene deletedAt
    });

    
    const autoresPorAgenda = new Map<string, string[]>();
    for (const a of todosAnfitrionesRaw as any[]) {
      const key = String(a.agenda_id);
      if (!autoresPorAgenda.has(key)) autoresPorAgenda.set(key, []);
      autoresPorAgenda.get(key)!.push(String(a.autor_id));
    }

    
    const idsComisionesUnidas = [
      ...new Set(
        (todosAnfitrionesRaw as any[])
          .map((a) => String(a.autor_id))
          .filter((aid) => aid !== comisionId)
      ),
    ];

    // Nombres de las comisiones unidas en batch
    const comisionesUnidasBD = idsComisionesUnidas.length
      ? await Comision.findAll({
          where: { id: { [Op.in]: idsComisionesUnidas } },
          attributes: ["id", "nombre"],
          raw: true,
          paranoid: false,
        })
      : [];

    const comisionesUnidasMapa = new Map<string, string>(
      (comisionesUnidasBD as any[]).map((c: any) => [String(c.id), c.nombre ?? "-"])
    );

   
    const agendasRaw = await Agenda.findAll({
      where: { id: { [Op.in]: agendaIds } },
      attributes: ["id", "fecha", "descripcion", "liga"],
      include: [{ model: TipoEventos, as: "tipoevento", attributes: ["nombre"] }],
    });

    const agendasMap = new Map<string, any>();
    for (const ag of agendasRaw as any[]) {
      const agJson = typeof ag.toJSON === "function" ? ag.toJSON() : ag;
      agendasMap.set(String(agJson.id), agJson);
    }

   
    const puntosOrdenRaw = await PuntosOrden.findAll({
      where: { id_evento: { [Op.in]: agendaIds } },
      attributes: ["id", "punto", "nopunto", "tribuna", "dispensa", "id_evento"],
      order: [["nopunto", "ASC"]],
      raw: true,
    });

    const puntosMap      = new Map<string, any>();
    const puntosPorAgenda = new Map<string, any[]>();

    for (const p of puntosOrdenRaw as any[]) {
      puntosMap.set(String(p.id), p);
      const agId = String(p.id_evento);
      if (!puntosPorAgenda.has(agId)) puntosPorAgenda.set(agId, []);
      puntosPorAgenda.get(agId)!.push(p);
    }

    const todosLosPuntosIds = [...puntosMap.keys()];

    
    const iniciativasDB = todosLosPuntosIds.length
      ? await IniciativaPuntoOrden.findAll({
          where: { id_punto: { [Op.in]: todosLosPuntosIds }, publico: 1 },
          attributes: ["id", "id_punto"],
          raw: true,
        })
      : [];

    const iniciativasPorPunto = new Map<string, string[]>();
    const iniciativasIds      = new Set<string>();

    for (const ini of iniciativasDB as any[]) {
      const puntoId = String(ini.id_punto);
      const iniId   = String(ini.id);
      iniciativasIds.add(iniId);
      if (!iniciativasPorPunto.has(puntoId)) iniciativasPorPunto.set(puntoId, []);
      iniciativasPorPunto.get(puntoId)!.push(iniId);
    }

    const votosRaw = todosLosPuntosIds.length
      ? await VotosPunto.findAll({
          where: {
            id_punto:  { [Op.in]: todosLosPuntosIds },
            deletedAt: null,
          },
          attributes: ["id_punto"],
          group: ["id_punto"],
          raw: true,
        })
      : [];

    const puntosConVoto = new Set<string>(
      (votosRaw as any[]).map((v) => String(v.id_punto))
    );

   
    const reporte    = await construirReporteBase();
    const reporteMap = new Map<string, ReporteBaseItem>();
    for (const item of reporte) {
      reporteMap.set(String(item.id), item);
    }

    const fueVotada = (observac: string): boolean =>
      ["Aprobada", "Rechazada en sesión", "Rechazada en comisión"].includes(observac);

    
    const todasLasIniciativasFiltradas: ReporteBaseItem[] = [];

    const eventos = agendaIds
      .map((agId) => {
        const agenda       = agendasMap.get(agId);
        const puntosDelDia = puntosPorAgenda.get(agId) ?? [];

        
        const autoresDelEvento  = autoresPorAgenda.get(agId) ?? [];
        const comisionesUnidas  = autoresDelEvento
          .filter((aid) => aid !== comisionId)
          .map((aid) => ({
            comision_id: aid,
            nombre:      comisionesUnidasMapa.get(aid) ?? "-",
          }));

        const ordenDelDia = puntosDelDia.map((punto) => {
          const iniIds      = iniciativasPorPunto.get(String(punto.id)) ?? [];
          const iniciativas = iniIds
            .map((iniId) => {
              const item = reporteMap.get(iniId);
              if (!item) return null;
              todasLasIniciativasFiltradas.push(item);
              return { ...item, votada: fueVotada(item.observac) };
            })
            .filter(Boolean);

          return {
            punto_id:          punto.id,
            nopunto:           punto.nopunto  ?? null,
            descripcion:       punto.punto    ?? "-",
            tribuna:           String(punto.tribuna)  === "1",
            dispensa:          String(punto.dispensa) === "1",
            voto:              puntosConVoto.has(String(punto.id)),
            tiene_iniciativas: iniciativas.length > 0,
            iniciativas,
          };
        });

        const todasIniEvento = ordenDelDia.flatMap((p) => p.iniciativas);

        return {
          evento_id:         agId,
          fecha:             agenda?.fecha       ?? null,
          fecha_fmt:         formatearFechaCorta(agenda?.fecha),
          descripcion:       agenda?.descripcion ?? "-",
          liga:              agenda?.liga        ?? null,
          tipo_evento:       agenda?.tipoevento?.nombre ?? "-",
          es_unida:          comisionesUnidas.length > 0,   
          comisiones_unidas: comisionesUnidas,              
          total_puntos:      ordenDelDia.length,
          total_iniciativas: todasIniEvento.length,
          votadas:           todasIniEvento.filter((i: any) => i.votada).length,
          no_votadas:        todasIniEvento.filter((i: any) => !i.votada).length,
          orden_del_dia:     ordenDelDia,
        };
      })
      .sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });

    
    const iniciativasUnicas = deduplicarPorId(todasLasIniciativasFiltradas);

    const resumenGlobal = {
      total_eventos:       eventos.length,
      total_iniciativas:   iniciativasUnicas.length,
      total_votadas:       iniciativasUnicas.filter((i) => fueVotada(i.observac)).length,
      total_no_votadas:    iniciativasUnicas.filter((i) => !fueVotada(i.observac)).length,
      aprobadas:           iniciativasUnicas.filter((i) => i.observac === "Aprobada").length,
      rechazadas_sesion:   iniciativasUnicas.filter((i) => i.observac === "Rechazada en sesión").length,
      rechazadas_comision: iniciativasUnicas.filter((i) => i.observac === "Rechazada en comisión").length,
      en_estudio:          iniciativasUnicas.filter((i) => i.observac === "En estudio").length,
    };

    return res.status(200).json({
      ok: true,
      data: {
        comision_id: String(comision.id),
        comision:    comision.nombre,
        resumen:     resumenGlobal,
        eventos,
      },
    });
  } catch (error: any) {
    console.error("Error al obtener eventos por comisión:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const getifnini = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    return await generarExcelSimple(res,"Reporte Iniciativas","reporte_iniciativas.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"ID", key:"id", width:40 },
      { header:"AUTOR", key:"autor", width:28 },
      { header:"PRESENTA", key:"autor_detalle", width:35 },
      { header:"DIPUTADO", key:"diputado", width:30 },
      { header:"GRUPO PARLAMENTARIO", key:"grupo_parlamentario", width:25 },
      { header:"INICIATIVA", key:"iniciativa", width:55 },
      { header:"MATERIA", key:"materia", width:45 },
      { header:"PRESENTAC.", key:"presentac", width:15 },
      { header:"COMISIONES", key:"comisiones", width:40 },
      { header:"EXPEDICIÓN", key:"expedicion", width:15 },
      { header:"OBSERVAC.", key:"observac", width:20 },
      { header:"PERIODO", key:"periodo", width:15 },
    ], reporte);
  } catch (error: any) {
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getIniciativasEnEstudio = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte  = await construirReporteBase();
    const filtrado = reporte.filter((i) => i.observac === "En estudio");
    return await generarExcelSimple(res,"En estudio","reporte_iniciativas_en_estudio.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"ID", key:"id", width:40 },
      { header:"AUTOR", key:"autor", width:28 },
      { header:"PRESENTA", key:"autor_detalle", width:35 },
      { header:"DIPUTADO", key:"diputado", width:30 },
      { header:"GRUPO PARLAMENTARIO", key:"grupo_parlamentario", width:25 },
      { header:"INICIATIVA", key:"iniciativa", width:55 },
      { header:"MATERIA", key:"materia", width:45 },
      { header:"PRESENTAC.", key:"presentac", width:15 },
      { header:"COMISIONES", key:"comisiones", width:40 },
      { header:"OBSERVAC.", key:"observac", width:20 },
      { header:"PERIODO", key:"periodo", width:15 },
    ], filtrado);
  } catch (error: any) {
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getIniciativasAprobadas = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte  = await construirReporteBase();
    const filtrado = reporte.filter((i) => i.observac === "Aprobada");
    return await generarExcelSimple(res,"Aprobadas","reporte_iniciativas_aprobadas.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"ID", key:"id", width:40 },
      { header:"AUTOR", key:"autor", width:28 },
      { header:"PRESENTA", key:"autor_detalle", width:35 },
      { header:"DIPUTADO", key:"diputado", width:30 },
      { header:"GRUPO PARLAMENTARIO", key:"grupo_parlamentario", width:25 },
      { header:"INICIATIVA", key:"iniciativa", width:55 },
      { header:"MATERIA", key:"materia", width:45 },
      { header:"PRESENTAC.", key:"presentac", width:15 },
      { header:"COMISIONES", key:"comisiones", width:40 },
      { header:"EXPEDICIÓN", key:"expedicion", width:15 },
      { header:"OBSERVAC.", key:"observac", width:20 },
      { header:"PERIODO", key:"periodo", width:15 },
    ], filtrado);
  } catch (error: any) {
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getIniciativasPorGrupoYDiputado = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    const mapa    = new Map<string, any>();

    for (const item of reporte) {
      const diputado = item.diputado || "-";
      const grupo    = item.grupo_parlamentario || "-";
      const llave    = `${diputado}__${grupo}`;

      if (!mapa.has(llave)) mapa.set(llave, { diputado, grupo_parlamentario: grupo, pendientes:0, en_estudio:0, aprobadas:0, total:0 });

      const fila = mapa.get(llave);
      if (item.observac === "En estudio") fila.en_estudio += 1;
      if (item.observac === "Aprobada")   fila.aprobadas  += 1;
      if (item.observac === "Pendiente")  fila.pendientes += 1;
      fila.total += 1;
    }

    const resultado = [...mapa.values()].sort((a, b) =>
      a.grupo_parlamentario.localeCompare(b.grupo_parlamentario) || a.diputado.localeCompare(b.diputado)
    );

    return await generarExcelSimple(res,"Grupo y Diputado","reporte_iniciativas_grupo_diputado.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"DIPUTADO", key:"diputado", width:35 },
      { header:"GRUPO PARLAMENTARIO", key:"grupo_parlamentario", width:30 },
      { header:"PENDIENTES", key:"pendientes", width:15 },
      { header:"EN ESTUDIO", key:"en_estudio", width:15 },
      { header:"APROBADAS", key:"aprobadas", width:15 },
      { header:"TOTAL", key:"total", width:12 },
    ], resultado);
  } catch (error: any) {
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getTotalesPorPeriodo = async (req: Request, res: Response): Promise<any> => {
  try {
    const reporte = await construirReporteBase();
    const mapa    = new Map<string, any>();

    for (const item of reporte) {
      const periodo = item.periodo || "-";
      if (!mapa.has(periodo)) mapa.set(periodo, { periodo, pendientes:0, en_estudio:0, aprobadas:0, total:0 });
      const fila = mapa.get(periodo);
      if (item.observac === "En estudio") fila.en_estudio += 1;
      if (item.observac === "Aprobada")   fila.aprobadas  += 1;
      if (item.observac === "Pendiente")  fila.pendientes += 1;
      fila.total += 1;
    }

    const resultado = [...mapa.values()].sort((a, b) => a.periodo.localeCompare(b.periodo));

    return await generarExcelSimple(res,"Totales por periodo","reporte_iniciativas_totales_periodo.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"PERIODO", key:"periodo", width:18 },
      { header:"PENDIENTES", key:"pendientes", width:15 },
      { header:"EN ESTUDIO", key:"en_estudio", width:15 },
      { header:"APROBADAS", key:"aprobadas", width:15 },
      { header:"TOTAL", key:"total", width:12 },
    ], resultado);
  } catch (error: any) {
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getReporteIniciativasIntegrantes = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id_tipo, id } = req.body;

    if (![1, 2, "1", "2"].includes(id_tipo))
      return res.status(400).json({ message: "id_tipo inválido. Debe ser 1 (Diputado) o 2 (Grupo Parlamentario)" });
    if (id === undefined || id === null || id === "")
      return res.status(400).json({ message: "El campo id es obligatorio. Usa 0 para traer todos." });

    const tipo     = Number(id_tipo);
    const filtroId = String(id);

    const ID_TIPO_PRESENTA_DIPUTADO = 9;
    const ID_TIPO_PRESENTA_GRUPO    = 19;

    const wherePresenta: any = { id_tipo_presenta: tipo === 2 ? ID_TIPO_PRESENTA_DIPUTADO : ID_TIPO_PRESENTA_GRUPO };
    if (filtroId !== "0") wherePresenta.id_presenta = filtroId;

    const [relaciones, reporte] = await Promise.all([
      IniciativasPresenta.findAll({ where: wherePresenta, attributes: ["id_iniciativa","id_presenta"], raw: true }),
      construirReporteBase(),
    ]);

    if (!(relaciones as any[]).length)
      return res.status(404).json({ message: "No se encontraron iniciativas para el filtro enviado" });

    const iniciativasIds = new Set((relaciones as any[]).map((r) => String(r.id_iniciativa)).filter(Boolean));
    const reporteFiltrado = reporte.filter((i) => iniciativasIds.has(String(i.id)));

    if (!reporteFiltrado.length)
      return res.status(404).json({ message: "No se encontraron datos en el reporte base para esas iniciativas" });

    const contarFila = (items: any[]) => ({
      pendientes: 0, en_estudio: 0, dictaminadas: 0, aprobadas: 0,
      rechazadas_comision: 0, rechazadas_sesion: 0, total: 0,
      ...items.reduce((acc: any, i: any) => {
        if (i.observac === "Pendiente")            acc.pendientes           += 1;
        if (i.observac === "En estudio")           acc.en_estudio           += 1;
        if (i.observac === "Dictaminada")          acc.dictaminadas         += 1;
        if (i.observac === "Aprobada")             acc.aprobadas            += 1;
        if (i.observac === "Rechazada en comisión") acc.rechazadas_comision += 1;
        if (i.observac === "Rechazada en sesión")  acc.rechazadas_sesion    += 1;
        acc.total += 1;
        return acc;
      }, { pendientes:0, en_estudio:0, dictaminadas:0, aprobadas:0, rechazadas_comision:0, rechazadas_sesion:0, total:0 }),
    });

    if (tipo === 2) {
      // Por Diputado
      const presentasIds = [...new Set((relaciones as any[]).map((r) => String(r.id_presenta)).filter(Boolean))];
      const dipDB = await Diputado.findAll({
        where: { id: { [Op.in]: presentasIds } },
        attributes: ["id","apaterno","amaterno","nombres"],
        raw: true,
      });
      const dipMap = new Map((dipDB as any[]).map((d) => [
        String(d.id),
        `${d.apaterno ?? ""} ${d.amaterno ?? ""} ${d.nombres ?? ""}`.trim() || "-",
      ]));

      const iniPorDip = new Map<string, Set<string>>();
      for (const r of relaciones as any[]) {
        const k = String(r.id_presenta);
        if (!iniPorDip.has(k)) iniPorDip.set(k, new Set());
        iniPorDip.get(k)!.add(String(r.id_iniciativa));
      }

      const resultado = presentasIds
        .map((dipId) => {
          const iniSet  = iniPorDip.get(dipId) ?? new Set();
          const items   = reporteFiltrado.filter((i) => iniSet.has(String(i.id)));
          if (!items.length) return null;
          return { diputado_id: dipId, diputado: dipMap.get(dipId) ?? "-", ...contarFila(items) };
        })
        .filter((r) => r && r.diputado !== "-" && r.total > 0)
        .sort((a: any, b: any) => a.diputado.localeCompare(b.diputado));

      return await generarExcelSimple(res,"Reporte Diputados","reporte_iniciativas_diputados.xlsx",[
        { header:"NO.", key:"no", width:8 },
        { header:"ID DIPUTADO", key:"diputado_id", width:18 },
        { header:"DIPUTADO", key:"diputado", width:35 },
        { header:"PENDIENTES", key:"pendientes", width:15 },
        { header:"EN ESTUDIO", key:"en_estudio", width:15 },
        { header:"DICTAMINADAS", key:"dictaminadas", width:15 },
        { header:"APROBADAS", key:"aprobadas", width:15 },
        { header:"RECH. COMISIÓN", key:"rechazadas_comision", width:18 },
        { header:"RECH. SESIÓN", key:"rechazadas_sesion", width:18 },
        { header:"TOTAL", key:"total", width:12 },
      ], resultado as any[]);
    }

    // Por Grupo Parlamentario
    const gruposIds = [...new Set((relaciones as any[]).map((r) => String(r.id_presenta)).filter(Boolean))];
    const gruposDB  = await Partidos.findAll({
      where: { id: { [Op.in]: gruposIds } },
      attributes: ["id","nombre"],
      raw: true,
    });
    const gruposMap = new Map((gruposDB as any[]).map((g) => [String(g.id), g.nombre || "-"]));

    const iniPorGrupo = new Map<string, Set<string>>();
    for (const r of relaciones as any[]) {
      const k = String(r.id_presenta);
      if (!iniPorGrupo.has(k)) iniPorGrupo.set(k, new Set());
      iniPorGrupo.get(k)!.add(String(r.id_iniciativa));
    }

    const resultado = gruposIds
      .map((grupoId) => {
        const iniSet = iniPorGrupo.get(grupoId) ?? new Set();
        const items  = reporteFiltrado.filter((i) => iniSet.has(String(i.id)));
        if (!items.length) return null;
        return { grupo_parlamentario_id: grupoId, grupo_parlamentario: gruposMap.get(grupoId) ?? "-", ...contarFila(items) };
      })
      .filter((r) => r && r.grupo_parlamentario !== "-" && r.total > 0)
      .sort((a: any, b: any) => a.grupo_parlamentario.localeCompare(b.grupo_parlamentario));

    return await generarExcelSimple(res,"Reporte Grupos","reporte_iniciativas_grupos_parlamentarios.xlsx",[
      { header:"NO.", key:"no", width:8 },
      { header:"ID GRUPO", key:"grupo_parlamentario_id", width:18 },
      { header:"GRUPO PARLAMENTARIO", key:"grupo_parlamentario", width:35 },
      { header:"PENDIENTES", key:"pendientes", width:15 },
      { header:"EN ESTUDIO", key:"en_estudio", width:15 },
      { header:"DICTAMINADAS", key:"dictaminadas", width:15 },
      { header:"APROBADAS", key:"aprobadas", width:15 },
      { header:"RECH. COMISIÓN", key:"rechazadas_comision", width:18 },
      { header:"RECH. SESIÓN", key:"rechazadas_sesion", width:18 },
      { header:"TOTAL", key:"total", width:12 },
    ], resultado as any[]);

  } catch (error: any) {
    console.error("Error al generar Excel de integrantes:", error);
    return res.status(500).json({ message:"Error interno del servidor", error: error.message });
  }
};

export const getVotosCierre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // 1. Obtener el punto de la iniciativa
    const iniciativa = await IniciativaPuntoOrden.findOne({
      where: { id },
      attributes: ['id_punto'],
    });

    if (!iniciativa?.id_punto) {
      return res.status(404).json({ msg: 'No se encontró el punto de la iniciativa' });
    }

    const idPunto = String(iniciativa.id_punto);

    // 2. Verificar si tiene dispensa
    const puntoOrigen = await PuntosOrden.findOne({
      where: { id: idPunto },
      attributes: ['id', 'dispensa'],
    });

    if (!puntoOrigen) {
      return res.status(404).json({ msg: 'Punto origen no encontrado' });
    }

    const tieneDispensa = puntoOrigen.dispensa === 1;

    // 3. Determinar el punto de votación
    let puntoDestino: string;

    if (tieneDispensa) {
      puntoDestino = idPunto;
    } else {
      const destinoEncontrado = await getPuntoDestino(idPunto);
      if (!destinoEncontrado) {
        return res.status(404).json({ msg: 'No hay cierre registrado para esta iniciativa' });
      }
      puntoDestino = destinoEncontrado;
    }

    // 4. Obtener info del punto y su evento
    const punto = await PuntosOrden.findOne({
      where: { id: puntoDestino },
      attributes: ['id', 'nopunto', 'punto', 'id_evento'],
    });

    if (!punto) {
      return res.status(404).json({ msg: 'Punto destino no encontrado' });
    }

    const evento = await Agenda.findOne({
      where: { id: punto.id_evento },
      include: [
        { model: Sedes,       as: 'sede',       attributes: ['id', 'sede'] },
        { model: TipoEventos, as: 'tipoevento', attributes: ['id', 'nombre'] },
      ],
    });

    if (!evento) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    const esSesion   = evento.tipoevento?.nombre === 'Sesión';
    const tipoEvento = esSesion ? 'sesion' : 'comision';
    const tipovento  = esSesion ? 1 : 2;

    // 5. Verificar que exista votación
    const votosExistentes = await VotosPunto.findOne({ where: { id_punto: puntoDestino } });

    if (!votosExistentes) {
      return res.status(404).json({ msg: 'No hay votación registrada para este cierre' });
    }

    // 6. Obtener y retornar resultados
    const integrantes = await obtenerResultadosVotacionOptimizado(
      null,
      puntoDestino,
      tipoEvento
    );

    return res.status(200).json({
      punto: {
        id:      punto.id,
        nopunto: punto.nopunto,
        punto:   punto.punto,
      },
      evento,
      integrantes,
      tipovento,
      dispensa: tieneDispensa,
    });

  } catch (error: any) {
    console.error('Error getVotosCierre:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

async function obtenerListadoDiputados(evento: any) {
  const listadoDiputados: { id_diputado: string; id_partido: string; comision_dip_id: string | null; id_cargo_dip: string | null }[] = [];
  
    const dipasociados = await TipoCargoComision.findOne({
      where: { valor: "Diputado Asociado" }
    });

    const diputados = await AsistenciaVoto.findAll({
      where: {
        id_agenda: evento.id,
      }
    });
    for (const inteLegis of diputados) {
            listadoDiputados.push({
            id_diputado: inteLegis.id_diputado,
            id_partido: inteLegis.partido_dip,
            comision_dip_id: inteLegis.comision_dip_id,
            id_cargo_dip: inteLegis.id_cargo_dip,
          });
    }
  return listadoDiputados;
}

async function obtenerResultadosVotacionOptimizado(
  idTemaPuntoVoto: string | null,
  idPunto: string | null,
  tipoEvento: 'sesion' | 'comision'
): Promise<ResultadoVotacion[] | ComisionAgrupada[]> {
    
    const dipasociados = await TipoCargoComision.findOne({
      where: { valor: "Diputado Asociado" }
    });

    const whereConditions: any = {};
    
    if (idTemaPuntoVoto) {
      whereConditions.id_tema_punto_voto = idTemaPuntoVoto;
    } else if (idPunto) {
      whereConditions.id_punto = idPunto;
    } else {
      return []; // No hay nada que buscar
    }

    const votosRaw = await VotosPunto.findAll({
      where: whereConditions,
      raw: true,
    });
    
    if (votosRaw.length === 0) {
      return [];
    }

  const diputadoIds = votosRaw.map(v => v.id_diputado).filter(Boolean);
  const diputados = await Diputado.findAll({
    where: { id: diputadoIds },
    attributes: ["id", "apaterno", "amaterno", "nombres"],
    raw: true,
    paranoid: false,
  });
  const diputadosMap = new Map(
    diputados.map(d => [d.id, d])
  );

  const partidoIds = votosRaw.map(v => v.id_partido).filter(Boolean);
  const partidos = await Partidos.findAll({
    where: { id: partidoIds },
    attributes: ["id", "siglas"],
    raw: true,
  });
  const partidosMap = new Map(
    partidos.map(p => [p.id, p])
  );

  let comisionesMap = new Map();
  let cargosMap = new Map();
  
  if (tipoEvento === 'comision') {
    const comisionIds = votosRaw
      .map(v => v.id_comision_dip)
      .filter(Boolean);
    
    if (comisionIds.length > 0) {
      const comisiones = await Comision.findAll({
        where: { id: comisionIds },
        attributes: ["id", "nombre", "importancia"],
        raw: true,
      });
      comisionesMap = new Map(
        comisiones.map(c => [c.id, c])
      );
    }

    const cargoIds = votosRaw  
      .map(v => v.id_cargo_dip)
      .filter(Boolean);
    
    if (cargoIds.length > 0) {
      const cargos = await TipoCargoComision.findAll({
        where: { id: cargoIds },
        attributes: ["id", "valor", "nivel"],
        raw: true,
      });
      cargosMap = new Map(
        cargos.map(c => [c.id, c] )
      );
    }
  }

  const resultados: ResultadoVotacion[] = votosRaw.map((voto) => {
    const diputado = diputadosMap.get(voto.id_diputado);
    const partido = partidosMap.get(voto.id_partido);
    const comision = comisionesMap.get(voto.id_comision_dip);
    const cargo = cargosMap.get(voto.id_cargo_dip);
    
    const nombreCompletoDiputado = diputado
      ? `${diputado.apaterno ?? ""} ${diputado.amaterno ?? ""} ${diputado.nombres ?? ""}`.trim()
      : null;

    const resultado: ResultadoVotacion = {
      id: voto.id,
      sentido: voto.sentido,
      mensaje: voto.mensaje,
      id_diputado: voto.id_diputado,
      id_partido: voto.id_partido,
      id_comision_dip: voto.id_comision_dip,
      id_cargo_dip: voto.id_cargo_dip,
      diputado: nombreCompletoDiputado,
      partido: partido?.siglas || null,
    };

    if (tipoEvento === 'comision') {
      resultado.comision_nombre = comision?.nombre || null;
      resultado.comision_importancia = comision?.importancia || null;
      resultado.cargo = cargo?.valor || null;
      resultado.nivel_cargo = cargo?.nivel || 999;
    }

    return resultado;
  });


  if (tipoEvento === 'sesion') {
   
    resultados.sort((a, b) => {
      const nombreA = a.diputado || '';
      const nombreB = b.diputado || '';
      return nombreA.localeCompare(nombreB, 'es');
    });
    return resultados;
    
  } else {
    resultados.sort((a, b) => {
      const nivelA = a.nivel_cargo || 999;
      const nivelB = b.nivel_cargo || 999;
      return nivelA - nivelB;
    });

    const agrupados = resultados.reduce((acc, voto) => {
      const comisionId = voto.id_comision_dip || 'sin_comision';
      
      if (!acc[comisionId]) {
        acc[comisionId] = {
          comision_id: voto.id_comision_dip,
          comision_nombre: voto.comision_nombre || null,
          importancia: voto.comision_importancia || null,
          integrantes: [],
        };
      }
      
      acc[comisionId].integrantes.push(voto);
      return acc;
    }, {} as Record<string, ComisionAgrupada>);

    const resultado = Object.values(agrupados).sort((a, b) => {
      const importanciaA = parseInt(a.importancia || '999');
      const importanciaB = parseInt(b.importancia || '999');
      return importanciaA - importanciaB;
    });

    return resultado;
  }
}

interface ResultadoVotacion {
  id: string;
  sentido: number;
  mensaje: string;
  id_diputado: string;
  id_partido: string;
  id_comision_dip: string | null;
  id_cargo_dip: string | null;
  diputado: string | null;
  partido: string | null;
  comision_nombre?: string;
  comision_importancia?: string;
  cargo?: string;
  nivel_cargo?: number;
}

interface ComisionAgrupada {
  comision_id: string | null;
  comision_nombre: string | null;
  importancia: string | null;
  integrantes: ResultadoVotacion[];
}

const getPuntoDestino = async (
  idPunto: string,
): Promise<string | null> => {

  // Obtener estudios previos (type 1 directo y type 2 por expediente)
  // igual que getifnini construye fuenteEstudios
  const estudiosType1 = await IniciativaEstudio.findAll({
    where: { punto_origen_id: idPunto, type: 1 },
    attributes: ['id', 'status', 'punto_origen_id', 'punto_destino_id', 'type'],
  });

  // Buscar expedientes relacionados al punto origen
  const expedientesOrigen = await ExpedienteEstudiosPuntos.findAll({
    where: { punto_origen_sesion_id: idPunto },
    attributes: ['expediente_id'],
  });

  const expedienteIdsOrigen = [
    ...new Set(expedientesOrigen.map((e: any) => e.expediente_id).filter(Boolean))
  ];

  const estudiosType2 = expedienteIdsOrigen.length > 0
    ? await IniciativaEstudio.findAll({
        where: {
          punto_origen_id: { [Op.in]: expedienteIdsOrigen },
          type: 2,
        },
        attributes: ['id', 'status', 'punto_origen_id', 'punto_destino_id', 'type'],
      })
    : [];

  // Armar fuenteEstudios igual que getifnini
  const fuenteEstudios = [
    ...estudiosType1.map((e: any) => e.toJSON()),
    ...estudiosType2.map((e: any) => e.toJSON()),
  ].filter(
    (e: any, index: number, self: any[]) =>
      index === self.findIndex((x: any) => x.id === e.id)
  );

  // Ahora armar posibles puntos incluyendo los punto_destino_id de estudios previos
  const posiblesPuntosIds = [
    idPunto,
    ...fuenteEstudios.map((e: any) => e.punto_destino_id).filter(Boolean)
  ];
  const posiblesPuntosUnicos = [...new Set(posiblesPuntosIds.filter(Boolean))];

  // Buscar expedientes relacionados a TODOS esos puntos
  const expedientesRelacionados = await ExpedienteEstudiosPuntos.findAll({
    where: {
      punto_origen_sesion_id: { [Op.in]: posiblesPuntosUnicos }
    },
    attributes: ['expediente_id'],
  });

  const expedienteIds = [
    ...new Set(
      expedientesRelacionados.map((e: any) => e.expediente_id).filter(Boolean)
    )
  ];

  // Construir OR dinámico
  const orConditions: any[] = [];

  if (posiblesPuntosUnicos.length > 0) {
    orConditions.push({
      punto_origen_id: { [Op.in]: posiblesPuntosUnicos },
      type: 1,
    });
  }

  if (expedienteIds.length > 0) {
    orConditions.push({
      punto_origen_id: { [Op.in]: expedienteIds },
      type: 2,
    });
  }

  if (orConditions.length === 0) return null;

  // Buscar el cierre (status 3)
  const estudio = await IniciativaEstudio.findOne({
    where: {
      status: '3',
      [Op.or]: orConditions,
    },
    order: [['createdAt', 'DESC']],
  });

  return estudio?.punto_destino_id ? String(estudio.punto_destino_id) : null;
};