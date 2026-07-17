/**
 * AUDITORÍA DE COBERTURA (SOLO LECTURA)
 * ------------------------------------------------------------------
 * Compara la lista "plana" de iniciativas del PDF (exportada a CSV)
 * contra el grafo YA LIGADO en la BD `registrocomisiones` y clasifica
 * cada renglón. NO inserta, actualiza ni borra nada.
 *
 * Uso:
 *   npx ts-node src/scripts/auditoria-cobertura.ts data/iniciativas.csv
 *
 * CSV de entrada (con encabezados; acentos/mayúsculas son tolerados):
 *   no, autor, iniciativa, materia, presentac, comisiones, expedicion, observac
 *   - `presentac`/`expedicion` en formato "DD-Mmm-YY" (05-Sep-24, 22-Oct-24, 09-Abr-26).
 *   - Si `presentac` trae dos fechas (caso "LXI LEGISLATURA"), se toma la PRIMERA.
 *
 * Salida:
 *   data/reporte-cobertura.csv  con una fila por iniciativa y su clasificación:
 *     - LIGADA_COMPLETA   → existe y está ligada a un punto del orden del día en esa fecha.
 *     - EXISTE_SIN_LIGAR  → el título existe en la BD pero sin punto, o en otra fecha/evento.
 *     - AMBIGUA           → varios candidatos fuertes en la misma fecha (revisar con el autor).
 *     - NO_EXISTE         → no se encontró en la BD.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

import Agenda from '../models/agendas';
import PuntosOrden from '../models/puntos_ordens';
import IniciativaPuntoOrden from '../models/inciativas_puntos_ordens';

// ─── Helpers de texto ────────────────────────────────────────────────────────

const quitarAcentos = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'del', 'y', 'a', 'en', 'con', 'por', 'para',
  'que', 'se', 'un', 'una', 'al', 'o', 'e', 'su', 'sus', 'lo', 'como',
  'iniciativa', 'proyecto', 'decreto', 'proyecto de decreto', 'diversas',
  'disposiciones', 'articulo', 'articulos', 'fraccion', 'fracciones', 'ley',
]);

function tokens(texto: string): Set<string> {
  const limpio = quitarAcentos(String(texto ?? '').toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  return new Set(limpio);
}

/** Jaccard sobre tokens (0..1). */
function similitud(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return inter / union;
}

// ─── Parseo de fechas "DD-Mmm-YY" (meses en español abreviados) ──────────────

const MESES: Record<string, number> = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};

/** Devuelve la PRIMERA fecha "DD-Mmm-YY" del texto como ISO "YYYY-MM-DD", o null. */
function fechaAISO(texto: string): string | null {
  const m = quitarAcentos(String(texto ?? '').toLowerCase())
    .match(/\b(\d{1,2})[-\/ ]([a-z]{3})[-\/ ](\d{2,4})\b/);
  if (!m) return null;
  const dia = parseInt(m[1], 10);
  const mes = MESES[m[2]];
  if (!mes) return null;
  let anio = parseInt(m[3], 10);
  if (anio < 100) anio += 2000;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** Fecha de un Date/valor de la BD a ISO "YYYY-MM-DD" (UTC). */
function isoDeBD(fecha: any): string | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// ─── Normalización de encabezados del CSV ────────────────────────────────────

function normalizarFila(row: Record<string, any>): {
  no: string; autor: string; iniciativa: string; materia: string;
  presentac: string; comisiones: string; expedicion: string; observac: string;
} {
  const idx: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    idx[quitarAcentos(k.toLowerCase().trim())] = k;
  }
  const g = (nombre: string) => String(row[idx[nombre]] ?? '').trim();
  return {
    no: g('no'),
    autor: g('autor'),
    iniciativa: g('iniciativa'),
    materia: g('materia'),
    presentac: g('presentac') || g('presentacion'),
    comisiones: g('comisiones'),
    expedicion: g('expedicion'),
    observac: g('observac') || g('observacion'),
  };
}

// ─── Escritura CSV ───────────────────────────────────────────────────────────

function csvCampo(v: any): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ─── Programa principal ──────────────────────────────────────────────────────

const UMBRAL = 0.6; // similitud mínima para considerar "mismo título"

async function main() {
  const entrada = process.argv[2] || 'data/iniciativas.csv';
  const rutaEntrada = path.resolve(process.cwd(), entrada);
  if (!fs.existsSync(rutaEntrada)) {
    console.error(`No encontré el CSV de entrada: ${rutaEntrada}`);
    console.error('Uso: npx ts-node src/scripts/auditoria-cobertura.ts <ruta-csv>');
    process.exit(1);
  }

  const registros: Record<string, any>[] = parse(fs.readFileSync(rutaEntrada), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  console.log(`Renglones en el PDF/CSV: ${registros.length}`);

  // ── Precarga del grafo ligado (una sola pasada) ──────────────────────────
  console.log('Cargando grafo de la BD (registrocomisiones)…');
  const [agendas, puntos, ipos] = await Promise.all([
    Agenda.findAll({ attributes: ['id', 'fecha'], raw: true }) as any,
    PuntosOrden.findAll({ attributes: ['id', 'id_evento', 'nopunto'], raw: true }) as any,
    IniciativaPuntoOrden.findAll({
      attributes: ['id', 'id_punto', 'id_evento', 'iniciativa', 'tipo'],
      raw: true, paranoid: false,
    }) as any,
  ]);

  const fechaEvento = new Map<string, string | null>(
    (agendas as any[]).map((a) => [String(a.id), isoDeBD(a.fecha)])
  );
  const puntoExiste = new Set<string>((puntos as any[]).map((p) => String(p.id)));

  // Índice de iniciativas de la BD, con tokens precomputados.
  type IpoIdx = {
    id: string; texto: string; toks: Set<string>;
    id_punto: string | null; id_evento: string | null; fechaEvento: string | null;
    ligadaAPunto: boolean;
  };
  const bdIndex: IpoIdx[] = (ipos as any[]).map((i) => ({
    id: String(i.id),
    texto: String(i.iniciativa ?? ''),
    toks: tokens(i.iniciativa ?? ''),
    id_punto: i.id_punto != null ? String(i.id_punto) : null,
    id_evento: i.id_evento != null ? String(i.id_evento) : null,
    fechaEvento: i.id_evento != null ? (fechaEvento.get(String(i.id_evento)) ?? null) : null,
    ligadaAPunto: i.id_punto != null && puntoExiste.has(String(i.id_punto)),
  }));

  // Bucket por fecha de evento para acelerar el match.
  const porFecha = new Map<string, IpoIdx[]>();
  for (const x of bdIndex) {
    if (!x.fechaEvento) continue;
    const arr = porFecha.get(x.fechaEvento) ?? [];
    arr.push(x);
    porFecha.set(x.fechaEvento, arr);
  }
  console.log(`Iniciativas en BD: ${bdIndex.length} | fechas de evento distintas: ${porFecha.size}`);

  // ── Clasificación ────────────────────────────────────────────────────────
  const salida: any[][] = [[
    'no', 'autor', 'iniciativa_pdf', 'presentac_pdf', 'fecha_iso',
    'clasificacion', 'similitud', 'ipo_id_match', 'id_punto', 'nopunto', 'evento_id', 'observacion',
  ]];

  const conteo: Record<string, number> = {
    LIGADA_COMPLETA: 0, EXISTE_SIN_LIGAR: 0, AMBIGUA: 0, NO_EXISTE: 0, SIN_FECHA: 0,
  };

  const puntoPorId = new Map<string, any>((puntos as any[]).map((p) => [String(p.id), p]));

  for (const raw of registros) {
    const fila = normalizarFila(raw);
    const iso = fechaAISO(fila.presentac);
    const tk = tokens(`${fila.iniciativa} ${fila.materia}`);

    const evaluar = (cands: IpoIdx[]) => {
      let mejor: IpoIdx | null = null;
      let mejorSim = 0;
      let fuertes = 0;
      for (const c of cands) {
        const s = similitud(tk, c.toks);
        if (s >= UMBRAL) fuertes++;
        if (s > mejorSim) { mejorSim = s; mejor = c; }
      }
      return { mejor, mejorSim, fuertes };
    };

    let clasificacion = 'NO_EXISTE';
    let observacion = '';
    let sim = 0;
    let match: IpoIdx | null = null;

    if (!iso) {
      clasificacion = 'SIN_FECHA';
      observacion = 'No pude interpretar la fecha de presentación; se buscó globalmente.';
    }

    // 1) Buscar en el bucket de la misma fecha.
    if (iso && porFecha.has(iso)) {
      const { mejor, mejorSim, fuertes } = evaluar(porFecha.get(iso)!);
      sim = mejorSim; match = mejor;
      if (mejor && mejorSim >= UMBRAL) {
        if (fuertes > 1) {
          clasificacion = 'AMBIGUA';
          observacion = `${fuertes} candidatos fuertes en la misma fecha; desambiguar por autor: ${fila.autor}`;
        } else if (mejor.ligadaAPunto) {
          clasificacion = 'LIGADA_COMPLETA';
        } else {
          clasificacion = 'EXISTE_SIN_LIGAR';
          observacion = 'Existe en el evento pero sin punto del orden del día ligado.';
        }
      }
    }

    // 2) Si no hubo match por fecha, buscar globalmente (existe pero mal ligada / otra fecha).
    if (clasificacion === 'NO_EXISTE' || clasificacion === 'SIN_FECHA') {
      const { mejor, mejorSim } = evaluar(bdIndex);
      if (mejor && mejorSim >= UMBRAL) {
        sim = mejorSim; match = mejor;
        clasificacion = 'EXISTE_SIN_LIGAR';
        observacion = observacion ||
          `Título encontrado, pero en evento con fecha ${mejor.fechaEvento ?? 'desconocida'} (esperada ${iso ?? '¿?'}).`;
      }
    }

    conteo[clasificacion] = (conteo[clasificacion] ?? 0) + 1;

    const punto = match?.id_punto ? puntoPorId.get(match.id_punto) : null;
    salida.push([
      fila.no, fila.autor, fila.iniciativa, fila.presentac, iso ?? '',
      clasificacion, sim.toFixed(2),
      match?.id ?? '', match?.id_punto ?? '', punto?.nopunto ?? '',
      match?.id_evento ?? '', observacion,
    ]);
  }

  // ── Escribir reporte ─────────────────────────────────────────────────────
  const rutaSalida = path.resolve(process.cwd(), 'data/reporte-cobertura.csv');
  fs.mkdirSync(path.dirname(rutaSalida), { recursive: true });
  fs.writeFileSync(rutaSalida, salida.map((r) => r.map(csvCampo).join(',')).join('\n'), 'utf8');

  console.log('\n── Resumen ──────────────────────────────');
  for (const [k, v] of Object.entries(conteo)) console.log(`  ${k.padEnd(18)} ${v}`);
  console.log(`\nReporte escrito en: ${rutaSalida}`);
  console.log('(Este script NO modificó la base de datos.)');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en la auditoría:', err);
    process.exit(1);
  });
