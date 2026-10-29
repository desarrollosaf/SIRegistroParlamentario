import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/registrocomisiones";
import Diputado from "../models/diputado";
import Comision from "../models/comisions";
import Partidos from "../models/partidos";
import TipoCargoComision from "../models/tipo_cargo_comisions";

const ESTADOS: Record<number, string> = { 1: "Presencial", 2: "Remota (Zoom)", 3: "Justificada", 0: "Pendiente" };
const ORDEN_ESTADOS = ["Presencial", "Remota (Zoom)", "Justificada", "Pendiente"];
// Mismos colores que la pantalla de asistencia: verde, azul, amarillo, gris.
const COLOR_ESTADO: Record<string, { fondo: string; texto: string }> = {
  "Presencial": { fondo: "FFE3F4E8", texto: "FF1E7B3C" },
  "Remota (Zoom)": { fondo: "FFE1EEFB", texto: "FF1D5FA8" },
  "Justificada": { fondo: "FFFFF4D6", texto: "FF9A6A00" },
  "Pendiente": { fondo: "FFEFEFEF", texto: "FF666666" },
};
const GUINDA = "FF96134B";
const GUINDA_CLARO = "FFF6E8EE";
const FUENTE = "Arial";
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ZONA = "America/Mexico_City";

interface Fila {
  fecha: Date;
  anio: number;
  reunion: string;
  tema: string;
  comision: string;
  diputado: string;
  partido: string;
  cargo: string;
  estado: string;
  idAgenda: string;
}

/** La BD guarda UTC; Excel no maneja zonas: se manda la hora "de pared" de Toluca
 *  para que el día no se recorra en reuniones de la tarde/noche. */
function aHoraLocal(fecha: Date): Date {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(fecha).map(x => [x.type, x.value])
  );
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second));
}

async function obtenerFilas(anio: number | null): Promise<Fila[]> {
  const registros = await sequelize.query<any>(
    `SELECT av.id_diputado, av.partido_dip, av.comision_dip_id, av.id_cargo_dip, av.sentido_voto, av.orden,
            a.id AS id_agenda, COALESCE(a.fecha_hora, a.fecha, a.fecha_hora_inicio) AS fecha, a.descripcion
       FROM asistencia_votos av
       JOIN agendas a ON a.id = av.id_agenda AND a.deleted_at IS NULL
       JOIN tipo_eventos te ON te.id = a.tipo_evento_id AND te.nombre = 'Comisión'
      WHERE av.deleted_at IS NULL`,
    { type: QueryTypes.SELECT }
  );
  const anfitriones = await sequelize.query<any>(
    `SELECT aa.agenda_id, aa.autor_id
       FROM anfitrion_agendas aa
       JOIN tipo_autors ta ON ta.id = aa.tipo_autor_id AND ta.valor = 'Comision'
      WHERE aa.deleted_at IS NULL`,
    { type: QueryTypes.SELECT }
  );

  // Catálogos (otra BD): se incluyen los dados de baja para no perder nombres históricos.
  const [diputados, comisiones, partidos, cargos] = await Promise.all([
    Diputado.findAll({ attributes: ["id", "apaterno", "amaterno", "nombres"], paranoid: false, raw: true }),
    Comision.findAll({ attributes: ["id", "nombre"], paranoid: false, raw: true }),
    Partidos.findAll({ attributes: ["id", "siglas", "nombre"], paranoid: false, raw: true }),
    TipoCargoComision.findAll({ attributes: ["id", "valor"], raw: true }),
  ]);
  const nomDip = new Map((diputados as any[]).map(d => [d.id, [d.apaterno, d.amaterno, d.nombres].filter(Boolean).join(" ").trim()]));
  const nomCom = new Map((comisiones as any[]).map(c => [c.id, c.nombre]));
  const nomPar = new Map((partidos as any[]).map(p => [p.id, p.siglas || p.nombre]));
  const nomCargo = new Map((cargos as any[]).map(c => [c.id, c.valor]));

  const comisionesDeReunion = new Map<string, Set<string>>();
  for (const a of anfitriones) {
    const set = comisionesDeReunion.get(a.agenda_id) ?? new Set<string>();
    set.add(nomCom.get(a.autor_id) ?? a.autor_id);
    comisionesDeReunion.set(a.agenda_id, set);
  }

  const filas: (Fila & { orden: number })[] = [];
  for (const r of registros) {
    if (!r.fecha) continue;
    const fecha = aHoraLocal(new Date(r.fecha));
    const anioFila = fecha.getUTCFullYear();
    if (anio && anioFila !== anio) continue;
    filas.push({
      fecha,
      anio: anioFila,
      reunion: [...(comisionesDeReunion.get(r.id_agenda) ?? [])].sort((x, y) => x.localeCompare(y, "es")).join(" / ") || "(sin comisión)",
      tema: String(r.descripcion ?? "").replace(/\s+/g, " ").trim(),
      comision: nomCom.get(r.comision_dip_id) ?? r.comision_dip_id ?? "",
      diputado: nomDip.get(r.id_diputado) ?? r.id_diputado,
      partido: nomPar.get(r.partido_dip) ?? r.partido_dip ?? "",
      cargo: nomCargo.get(r.id_cargo_dip) ?? r.id_cargo_dip ?? "",
      estado: ESTADOS[r.sentido_voto] ?? `Otro (${r.sentido_voto})`,
      idAgenda: r.id_agenda,
      orden: r.orden ?? 999,
    });
  }
  filas.sort((a, b) =>
    a.fecha.getTime() - b.fecha.getTime() || a.idAgenda.localeCompare(b.idAgenda) ||
    a.comision.localeCompare(b.comision, "es") || a.orden - b.orden || a.diputado.localeCompare(b.diputado, "es"));
  return filas;
}

// ── Estilos ────────────────────────────────────────────────────────────────
const fuente = (extra: any = {}) => ({ name: FUENTE, size: 10, ...extra });
const bordeInferior = { bottom: { style: "thin", color: { argb: "FFE3E3E3" } } };
const centro = { horizontal: "center", vertical: "middle", wrapText: true };

function titulo(ws: any, texto: string, sub: string) {
  ws.getCell("A1").value = texto;
  ws.getCell("A1").font = fuente({ size: 18, bold: true, color: { argb: GUINDA } });
  ws.getCell("A2").value = sub;
  ws.getCell("A2").font = fuente({ color: { argb: "FF595959" } });
  ws.getRow(1).height = 28;
}

function encabezado(ws: any, fila: number, textos: string[]) {
  textos.forEach((t, i) => {
    const c = ws.getCell(fila, i + 1);
    c.value = t;
    c.font = fuente({ bold: true, color: { argb: "FFFFFFFF" } });
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GUINDA } };
    c.alignment = centro;
  });
  ws.getRow(fila).height = 30;
}

function nota(ws: any, fila: number, texto: string) {
  ws.getCell(fila, 1).value = texto;
  ws.getCell(fila, 1).font = fuente({ color: { argb: "FF595959" } });
}

function colorearEstado(ws: any, ref: string) {
  const primera = ref.split(":")[0];
  ws.addConditionalFormatting({
    ref,
    rules: ORDEN_ESTADOS.map((estado, i) => ({
      type: "expression",
      priority: i + 1,
      formulae: [`${primera}="${estado}"`],
      style: {
        fill: { type: "pattern", pattern: "solid", bgColor: { argb: COLOR_ESTADO[estado].fondo } },
        font: { bold: true, color: { argb: COLOR_ESTADO[estado].texto } },
      },
    })),
  });
}

function barraPct(ws: any, ref: string) {
  ws.addConditionalFormatting({
    ref,
    rules: [{
      type: "dataBar", priority: 10, gradient: true,
      cfvo: [{ type: "num", value: 0 }, { type: "num", value: 1 }],
      color: { argb: "FFC9748F" },
    }],
  });
}

/** Renglones de conteo (Presencial..Pendiente, Total, %) de una tabla de resumen:
 *  columna A = clave, B = dato fijo, C..F = COUNTIFS contra la hoja Detalle. */
function tablaConteo(ws: any, claves: string[], colClaveDetalle: string, ultima: number, valorB: (k: string) => any) {
  claves.forEach((clave, idx) => {
    const f = 5 + idx;
    ws.getCell(f, 1).value = clave;
    ws.getCell(f, 2).value = valorB(clave);
    ORDEN_ESTADOS.forEach((estado, k) => {
      ws.getCell(f, 3 + k).value = {
        formula: `COUNTIFS(Detalle!$${colClaveDetalle}$5:$${colClaveDetalle}$${ultima},$A${f},Detalle!$H$5:$H$${ultima},"${estado}")`,
      };
      ws.getCell(f, 3 + k).numFmt = '#,##0;-#,##0;"-"';
    });
    ws.getCell(f, 7).value = { formula: `SUM(C${f}:F${f})` };
    ws.getCell(f, 7).numFmt = "#,##0";
    ws.getCell(f, 8).value = { formula: `IF(G${f}=0,0,(C${f}+D${f})/G${f})` };
    ws.getCell(f, 8).numFmt = "0.0%";
    for (let c = 1; c <= 8; c++) {
      const celda = ws.getCell(f, c);
      celda.font = fuente();
      celda.border = bordeInferior;
      celda.alignment = c > 1 ? { horizontal: "center", vertical: "middle" } : { vertical: "middle" };
    }
  });
  const fin = 4 + claves.length;
  const t = fin + 1;
  ws.getCell(t, 1).value = "TOTAL";
  for (let c = 3; c <= 7; c++) {
    const l = String.fromCharCode(64 + c);
    ws.getCell(t, c).value = { formula: `SUM(${l}5:${l}${fin})` };
    ws.getCell(t, c).numFmt = "#,##0";
  }
  ws.getCell(t, 8).value = { formula: `IF(G${t}=0,0,(C${t}+D${t})/G${t})` };
  ws.getCell(t, 8).numFmt = "0.0%";
  for (let c = 1; c <= 8; c++) {
    const celda = ws.getCell(t, c);
    celda.font = fuente({ bold: true });
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GUINDA_CLARO } };
    celda.alignment = { horizontal: c > 1 ? "center" : "left", vertical: "middle" };
  }
  barraPct(ws, `H5:H${fin}`);
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 4, showGridLines: false }];
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: fin, column: 8 } };
  return fin;
}

function construirLibro(filas: Fila[], etiquetaPeriodo: string) {
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "SIRegistroParlamentario";
  // Las fórmulas van sin resultado precalculado: Excel las calcula al abrir.
  wb.calcProperties = { fullCalcOnLoad: true };
  const ultima = 4 + filas.length;
  const reunionesTotales = new Set(filas.map(f => f.idAgenda)).size;

  // ── Resumen ──
  const res = wb.addWorksheet("Resumen", { properties: { tabColor: { argb: GUINDA } } });
  res.views = [{ showGridLines: false }];
  let periodo = etiquetaPeriodo;
  if (filas.length) {
    const d0 = filas[0].fecha, d1 = filas[filas.length - 1].fecha;
    const fmt = (d: Date) => `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    periodo = `${etiquetaPeriodo} (${fmt(d0)} – ${fmt(d1)})`;
  }
  titulo(res, "Asistencia a reuniones de comisión", `Congreso del Estado de México · SIRegistroParlamentario · Periodo: ${periodo}`);
  res.getCell("A4").value = "Reuniones de comisión";
  res.getCell("B4").value = reunionesTotales;
  res.getCell("A5").value = "Registros de asistencia";
  res.getCell("B5").value = { formula: `COUNTA(Detalle!$H$5:$H$${Math.max(ultima, 5)})` };
  for (const r of [4, 5]) {
    res.getCell(r, 1).font = fuente();
    res.getCell(r, 2).font = fuente({ size: 12, bold: true, color: { argb: GUINDA } });
    res.getCell(r, 2).numFmt = "#,##0";
    res.getCell(r, 2).alignment = { horizontal: "center" };
  }
  encabezado(res, 7, ["Asistencia", "Registros", "% del total"]);
  ORDEN_ESTADOS.forEach((estado, k) => {
    const f = 8 + k;
    res.getCell(f, 1).value = estado;
    res.getCell(f, 2).value = { formula: `COUNTIF(Detalle!$H$5:$H$${Math.max(ultima, 5)},A${f})` };
    res.getCell(f, 2).numFmt = "#,##0";
    res.getCell(f, 3).value = { formula: `IF($B$5=0,0,B${f}/$B$5)` };
    res.getCell(f, 3).numFmt = "0.0%";
    for (let c = 1; c <= 3; c++) {
      const celda = res.getCell(f, c);
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ESTADO[estado].fondo } };
      celda.font = fuente({ size: 11, bold: c === 1, color: { argb: COLOR_ESTADO[estado].texto } });
      celda.alignment = { horizontal: c === 1 ? "left" : "center", vertical: "middle" };
    }
    res.getRow(f).height = 22;
  });
  res.getCell("A12").value = "Total";
  res.getCell("B12").value = { formula: "SUM(B8:B11)" };
  res.getCell("C12").value = { formula: "SUM(C8:C11)" };
  res.getCell("A13").value = "Asistencia efectiva (Presencial + Remota)";
  res.getCell("B13").value = { formula: "B8+B9" };
  res.getCell("C13").value = { formula: "IF($B$5=0,0,B13/$B$5)" };
  for (const r of [12, 13]) {
    res.getCell(r, 2).numFmt = "#,##0";
    res.getCell(r, 3).numFmt = "0.0%";
    for (let c = 1; c <= 3; c++) {
      const celda = res.getCell(r, c);
      celda.font = fuente({ bold: true });
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GUINDA_CLARO } };
      celda.alignment = { horizontal: c === 1 ? "left" : "center", vertical: "middle" };
    }
    res.getRow(r).height = 22;
  }
  nota(res, 15, `Generado el ${new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, dateStyle: "long", timeStyle: "short" }).format(new Date())}. ` +
    'Solo eventos de tipo "Comisión"; se excluyen registros y eventos eliminados.');
  nota(res, 16, "Presencial = ASISTENCIA · Remota (Zoom) = ASISTENCIA ZOOM · Justificada = ASISTENCIA JUSTIFICADA · Pendiente = sin registrar.");
  nota(res, 17, 'Hojas: "Por comisión", "Por diputado" y "Detalle" (un renglón por diputado y reunión, con filtros).');
  res.getColumn(1).width = 44;
  res.getColumn(2).width = 14;
  res.getColumn(3).width = 14;

  // ── Por comisión ──
  const pc = wb.addWorksheet("Por comisión", { properties: { tabColor: { argb: GUINDA } } });
  titulo(pc, "Asistencia por comisión",
    "Conteo según la comisión a la que pertenece cada diputado en la reunión (en comisiones unidas cuenta en la suya).");
  encabezado(pc, 4, ["Comisión", "Reuniones", ...ORDEN_ESTADOS, "Total registros", "% asistencia"]);
  const reunionesPorComision = new Map<string, Set<string>>();
  for (const f of filas) {
    const s = reunionesPorComision.get(f.comision) ?? new Set<string>();
    s.add(f.idAgenda);
    reunionesPorComision.set(f.comision, s);
  }
  const comisiones = [...reunionesPorComision.keys()].sort((a, b) => a.localeCompare(b, "es"));
  const finPc = tablaConteo(pc, comisiones, "D", ultima, k => reunionesPorComision.get(k)!.size);
  pc.getCell(finPc + 1, 2).value = reunionesTotales;
  nota(pc, finPc + 3, "Reuniones: reuniones distintas en que la comisión tuvo diputados en lista (una reunión de comisiones unidas " +
    "cuenta para cada comisión; por eso el total no es la suma).");
  nota(pc, finPc + 4, "% asistencia = (Presencial + Remota) / Total registros.");
  [52, 11, 12, 13, 12, 12, 14, 16].forEach((w, i) => (pc.getColumn(i + 1).width = w));

  // ── Por diputado ──
  const pd = wb.addWorksheet("Por diputado", { properties: { tabColor: { argb: GUINDA } } });
  titulo(pd, "Asistencia por diputado(a)", "Todas las reuniones de comisión en que estuvo en lista.");
  encabezado(pd, 4, ["Diputado(a)", "Partido", ...ORDEN_ESTADOS, "Total registros", "% asistencia"]);
  const partidoDe = new Map<string, string>();
  for (const f of filas) if (!partidoDe.has(f.diputado)) partidoDe.set(f.diputado, f.partido);
  const dips = [...partidoDe.keys()].sort((a, b) => a.localeCompare(b, "es"));
  const finPd = tablaConteo(pd, dips, "E", ultima, k => partidoDe.get(k));
  nota(pd, finPd + 3, "% asistencia = (Presencial + Remota) / Total registros.");
  [42, 10, 12, 13, 12, 12, 14, 16].forEach((w, i) => (pd.getColumn(i + 1).width = w));

  // ── Detalle ──
  const de = wb.addWorksheet("Detalle", { properties: { tabColor: { argb: GUINDA } } });
  titulo(de, "Detalle de asistencia por reunión",
    "Un renglón por diputado y reunión, como se capturó en el sistema. Usa los filtros del encabezado.");
  const columnas = ["Fecha", "Reunión de comisión(es)", "Tema / asunto", "Comisión del diputado", "Diputado(a)",
    "Partido", "Cargo en la comisión", "Asistencia"];
  if (filas.length) {
    de.addTable({
      name: "Asistencias",
      ref: "A4",
      headerRow: true,
      style: { theme: "TableStyleLight1", showRowStripes: true },
      columns: columnas.map(name => ({ name, filterButton: true })),
      rows: filas.map(f => [f.fecha, f.reunion, f.tema, f.comision, f.diputado, f.partido, f.cargo, f.estado]),
    });
    for (let r = 5; r <= ultima; r++) {
      const row = de.getRow(r);
      row.font = fuente();
      row.getCell(1).numFmt = "dd/mm/yyyy";
      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(8).alignment = { horizontal: "center" };
    }
    colorearEstado(de, `H5:H${ultima}`);
  } else {
    encabezado(de, 4, columnas);
    nota(de, 5, "Sin registros en el periodo seleccionado.");
  }
  encabezado(de, 4, columnas); // mismo estilo guinda que las demás hojas
  [12, 42, 60, 38, 38, 10, 18, 16].forEach((w, i) => (de.getColumn(i + 1).width = w));
  de.views = [{ state: "frozen", ySplit: 4, showGridLines: false }];

  for (const ws of wb.worksheets) {
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  }
  return wb;
}

/** Años con reuniones de comisión (para el selector del frontend). */
export const getAniosAsistenciaComisiones = async (_req: Request, res: Response): Promise<any> => {
  try {
    const filas = await sequelize.query<any>(
      `SELECT DISTINCT YEAR(CONVERT_TZ(COALESCE(a.fecha_hora, a.fecha, a.fecha_hora_inicio), '+00:00', '-06:00')) AS anio
         FROM agendas a
         JOIN tipo_eventos te ON te.id = a.tipo_evento_id AND te.nombre = 'Comisión'
        WHERE a.deleted_at IS NULL AND COALESCE(a.fecha_hora, a.fecha, a.fecha_hora_inicio) IS NOT NULL
        ORDER BY anio DESC`,
      { type: QueryTypes.SELECT }
    );
    return res.json({ anios: filas.map(f => Number(f.anio)).filter(Boolean) });
  } catch (error: any) {
    console.error("Error al obtener años de asistencia:", error);
    return res.status(500).json({ msg: "Error interno del servidor", error: error.message });
  }
};

/** GET /api/reporte/asistencia/comisiones-excel?anio=2025  (sin anio o anio=todos → todo) */
export const getExcelAsistenciaComisiones = async (req: Request, res: Response): Promise<any> => {
  try {
    const anioParam = String(req.query.anio ?? "todos");
    const anio = /^\d{4}$/.test(anioParam) ? Number(anioParam) : null;
    const filas = await obtenerFilas(anio);
    const wb = construirLibro(filas, anio ? String(anio) : "Todos los años");
    const nombre = `asistencia_comisiones_${anio ?? "todos"}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombre}"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (error: any) {
    console.error("Error al generar Excel de asistencia de comisiones:", error);
    return res.status(500).json({ msg: "Error interno del servidor", error: error.message });
  }
};
