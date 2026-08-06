/**
 * Motor de reconciliación (SOLO LECTURA): para cada folio del Excel
 * histórico, busca el punto de orden del día REAL que le corresponde,
 * anclando por fecha exacta de presentación + coincidencia de texto, y
 * luego caminando el grafo real (iniciativas_estudios / expedientes) para
 * encontrar el punto real de Estudio/Dictamen y, si aplica, el cierre.
 *
 * No escribe nada en la BD. Genera:
 *   - backend/src/data/reportes-import-historico/reconciliacion.csv (resumen tabular)
 *   - backend/src/data/reportes-import-historico/reconciliacion.json (detalle completo)
 *
 * Uso: ts-node src/scripts/importar-historico/reconciliar.ts [--limite N]
 */
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { parse } from 'csv-parse/sync';

import Agenda from '../../models/agendas';
import { buscarAgendasPorFecha } from './agendas-por-fecha';
import PuntosOrden from '../../models/puntos_ordens';
import IniciativaEstudio from '../../models/iniciativas_estudio';
import ExpedienteEstudiosPuntos from '../../models/expedientes_estudio_puntos';

import { cargarTipoEventosReales } from './catalogos';
import { elegirMejorCandidato, Candidato } from './matching-texto';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');
const REPORTES_DIR = path.resolve(__dirname, '../../data/reportes-import-historico');
const CSV_SALIDA = path.join(REPORTES_DIR, 'reconciliacion.csv');
const JSON_SALIDA = path.join(REPORTES_DIR, 'reconciliacion.json');

// tipo_eventos: "Diputación permanente" — usada para presentar iniciativas
// fuera de periodo ordinario de sesiones (recesos).
const DIPUTACION_PERMANENTE_ID = 'a413e44b-550b-47ab-b004-a6f28c73a750';

interface FilaCsv {
  folio: string;
  texto_iniciativa: string;
  fecha_presentacion: string;
  tipo_evento: string;
  fecha_evento: string;
  fecha_aprobacion: string;
  estado: string;
  bandera: string;
}

interface HopReal {
  puntoId: number;
  agendaId: string;
  fechaReal: string | null;
  tipoEventoNombre: string;
  status: string;
  via: 'directo' | 'expediente';
  expedienteId?: number;
  esCierre: boolean;
  textoPunto: string;
  profundidad: number;
  origenId: string | number;
}

function diasEntre(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return null;
  return Math.round(Math.abs(da - db) / 86400000);
}

async function construirHop(
  estudio: any,
  origenId: string | number,
  via: 'directo' | 'expediente',
  expedienteId: number | undefined,
  tipoEventoPorId: Map<string, string>
): Promise<HopReal> {
  const destinoId = Number(estudio.punto_destino_id);
  const punto = await PuntosOrden.findByPk(destinoId);
  const agenda = punto ? await Agenda.findByPk((punto as any).id_evento) : null;
  return {
    puntoId: destinoId,
    agendaId: agenda ? (agenda as any).id : '',
    fechaReal: agenda ? new Date((agenda as any).fecha).toISOString().slice(0, 10) : null,
    tipoEventoNombre: agenda ? tipoEventoPorId.get((agenda as any).tipo_evento_id) || '?' : '?',
    status: String(estudio.status),
    via,
    expedienteId,
    esCierre: destinoId === Number(origenId),
    textoPunto: punto ? String((punto as any).punto || '').slice(0, 150) : '',
    profundidad: 0,
    origenId,
  };
}

/**
 * Busca TODAS las ramas que salen de un punto (no solo la primera): una
 * iniciativa turnada a varias comisiones genera un Expediente independiente
 * por cada comisión (y a veces por cada ronda de estudio), todos apuntando
 * a los mismos puntos de sesión de origen — no es una cadena lineal.
 */
async function buscarHopsDesde(
  origenId: string | number,
  tipoEventoPorId: Map<string, string>
): Promise<HopReal[]> {
  const hops: HopReal[] = [];

  // 1) camino directo: origenId ya es un punto real (o un expediente_id, en
  //    llamadas recursivas desde el camino por expediente).
  const directos = await IniciativaEstudio.findAll({ where: { punto_origen_id: String(origenId) } as any });
  for (const d of directos as any[]) {
    hops.push(await construirHop(d, origenId, d.type === '2' ? 'expediente' : 'directo', undefined, tipoEventoPorId));
  }

  // 2) camino(s) por expediente: origenId es un punto de SESIÓN que puede
  //    haber sido agrupado en varios expedientes distintos (uno por comisión
  //    turnada, o por ronda de estudio).
  const expPuntos = await ExpedienteEstudiosPuntos.findAll({ where: { punto_origen_sesion_id: origenId } as any });
  for (const expPunto of expPuntos as any[]) {
    const expedienteId = expPunto.expediente_id;
    const viasExpediente = await IniciativaEstudio.findAll({ where: { punto_origen_id: String(expedienteId) } as any });
    for (const v of viasExpediente as any[]) {
      hops.push(await construirHop(v, origenId, 'expediente', expedienteId, tipoEventoPorId));
    }
  }

  return hops;
}

async function main() {
  const limiteIdx = process.argv.indexOf('--limite');
  const limite = limiteIdx >= 0 ? parseInt(process.argv[limiteIdx + 1], 10) : Infinity;

  const filas: FilaCsv[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const { sesionId } = await cargarTipoEventosReales();

  const tipoEventosDb = await (await import('../../models/tipo_eventos')).default.findAll();
  const tipoEventoPorId = new Map<string, string>(tipoEventosDb.map((t: any) => [t.id, t.nombre]));

  const folios = new Map<string, FilaCsv[]>();
  for (const fila of filas) {
    if (!folios.has(fila.folio)) folios.set(fila.folio, []);
    folios.get(fila.folio)!.push(fila);
  }

  fs.mkdirSync(REPORTES_DIR, { recursive: true });

  const resultados: any[] = [];
  const csvFilas: string[] = [
    'folio,texto,fecha_presentacion,score_presentacion,agenda_presentacion_id,punto_presentacion_id,num_ramas_nivel1,via,expediente_id,punto_destino_id,tipo_evento_real,fecha_real_destino,fecha_evento_excel,status_destino,cierre_encontrado,fecha_cierre_real,fecha_aprobacion_excel,estado_excel,confianza',
  ];

  let procesados = 0;
  let conMatchPresentacion = 0;
  let sinAgendaPresentacion = 0;
  let sinMatchTexto = 0;
  let conCadenaReal = 0;
  let viaExpedienteCount = 0;
  let conCierre = 0;

  const cacheAgendasPorFecha = new Map<string, any[]>();

  for (const [folio, filasFolio] of folios) {
    if (procesados >= limite) break;
    const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
    if (usables.length === 0) continue;
    procesados++;

    const primeraFila = usables[0];
    const estadoFinal = usables[usables.length - 1].estado;
    const fechaPresentacion = primeraFila.fecha_presentacion;

    let agendas = cacheAgendasPorFecha.get(fechaPresentacion);
    if (!agendas) {
      agendas = fechaPresentacion ? await buscarAgendasPorFecha(fechaPresentacion, sesionId) : [];
      if (agendas.length === 0 && fechaPresentacion) {
        // Fuera de periodo ordinario, las iniciativas se presentan ante la
        // Diputación Permanente en vez de una Sesión — mismo mecanismo, otro
        // tipo_evento. Confirmado: 103/104 de los "sin agenda" tenían esto.
        agendas = await buscarAgendasPorFecha(fechaPresentacion, DIPUTACION_PERMANENTE_ID);
      }
      cacheAgendasPorFecha.set(fechaPresentacion, agendas);
    }

    if (agendas.length === 0) {
      sinAgendaPresentacion++;
      resultados.push({ folio, texto: primeraFila.texto_iniciativa, estado: 'sin_agenda_presentacion' });
      csvFilas.push(
        [folio, `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`, fechaPresentacion, '', '', '', '', '', '', '', '', '', '', '', '', '', usables[usables.length - 1].fecha_aprobacion, estadoFinal, 'sin_match'].join(',')
      );
      continue;
    }

    const candidatos: Candidato[] = [];
    for (const ag of agendas) {
      const puntos = await PuntosOrden.findAll({ where: { id_evento: (ag as any).id } as any });
      for (const p of puntos) candidatos.push({ id: (p as any).id, texto: (p as any).punto || '' });
    }

    const match = elegirMejorCandidato(primeraFila.texto_iniciativa, candidatos);
    if (!match) {
      sinMatchTexto++;
      resultados.push({ folio, texto: primeraFila.texto_iniciativa, estado: 'sin_match_texto', candidatos: candidatos.length });
      csvFilas.push(
        [folio, `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`, fechaPresentacion, '', '', '', '', '', '', '', '', '', '', '', '', '', usables[usables.length - 1].fecha_aprobacion, estadoFinal, 'sin_match'].join(',')
      );
      continue;
    }

    conMatchPresentacion++;
    const puntoPresentacion = candidatos.find((c) => c.id === match.puntoId)!;
    const agendaPresentacion = (agendas.find((ag: any) => true) as any); // misma fecha, se reporta la primera si hay varias

    // caminar el grafo real desde el punto de presentación: BFS ramificado
    // (una iniciativa turnada a varias comisiones genera una rama real por
    // cada una, más una por cada ronda de estudio — no es lineal).
    const ramas: HopReal[] = [];
    const porExplorar: { origenId: string | number; profundidad: number }[] = [{ origenId: match.puntoId, profundidad: 0 }];
    const visitados = new Set<string>();
    const MAX_PROFUNDIDAD = 4;
    while (porExplorar.length > 0) {
      const actual = porExplorar.shift()!;
      const key = String(actual.origenId);
      if (actual.profundidad >= MAX_PROFUNDIDAD || visitados.has(key)) continue;
      visitados.add(key);

      const hops = await buscarHopsDesde(actual.origenId, tipoEventoPorId);
      for (const hop of hops) {
        hop.profundidad = actual.profundidad + 1;
        ramas.push(hop);
        if (!hop.esCierre) porExplorar.push({ origenId: hop.puntoId, profundidad: hop.profundidad });
      }
    }

    const ramasNivel1 = ramas.filter((h) => h.profundidad === 1);
    if (ramas.length > 0) conCadenaReal++;
    if (ramas.some((h) => h.via === 'expediente')) viaExpedienteCount++;
    const hopsCierre = ramas.filter((h) => h.esCierre);
    if (hopsCierre.length > 0) conCierre++;

    const fechaEventoExcel = usables.find((f) => f.tipo_evento === 'Estudio' || f.tipo_evento === 'Dictamen')?.fecha_evento || '';
    // de todas las ramas de primer nivel, la más cercana en fecha a lo que dice el Excel
    let primerHop: HopReal | undefined;
    let diffEventoDias: number | null = null;
    for (const h of ramasNivel1) {
      const d = diasEntre(h.fechaReal, fechaEventoExcel);
      if (d !== null && (diffEventoDias === null || d < diffEventoDias)) {
        diffEventoDias = d;
        primerHop = h;
      }
    }
    if (!primerHop) primerHop = ramasNivel1[0];

    let hopCierre: HopReal | undefined;
    let diffCierreDias: number | null = null;
    for (const h of hopsCierre) {
      const d = diasEntre(h.fechaReal, usables[usables.length - 1].fecha_aprobacion);
      if (d !== null && (diffCierreDias === null || d < diffCierreDias)) {
        diffCierreDias = d;
        hopCierre = h;
      }
    }

    let confianza: string;
    if (!primerHop) confianza = match.score >= 0.5 ? 'media' : 'baja';
    else if (diffEventoDias !== null && diffEventoDias <= 3) confianza = 'alta';
    else if (diffEventoDias !== null && diffEventoDias <= 10) confianza = 'media';
    else confianza = 'baja';

    resultados.push({
      folio,
      texto: primeraFila.texto_iniciativa,
      fechaPresentacionExcel: fechaPresentacion,
      matchPresentacion: {
        agendaId: (agendaPresentacion as any)?.id,
        puntoId: match.puntoId,
        score: Number(match.score.toFixed(3)),
        margen: Number(match.margen.toFixed(3)),
        textoPunto: puntoPresentacion.texto.slice(0, 150),
        candidatosEnFecha: candidatos.length,
      },
      ramasReales: ramas,
      numRamasNivel1: ramasNivel1.length,
      estadoExcel: estadoFinal,
      fechaAprobacionExcel: usables[usables.length - 1].fecha_aprobacion,
      diffEventoDias,
      diffCierreDias,
      confianza,
    });

    csvFilas.push(
      [
        folio,
        `"${(primeraFila.texto_iniciativa || '').slice(0, 60).replace(/"/g, "'")}"`,
        fechaPresentacion,
        match.score.toFixed(3),
        (agendaPresentacion as any)?.id || '',
        match.puntoId,
        ramasNivel1.length,
        primerHop?.via || '',
        primerHop?.expedienteId || '',
        primerHop?.puntoId || '',
        primerHop?.tipoEventoNombre || '',
        primerHop?.fechaReal || '',
        fechaEventoExcel,
        primerHop?.status || '',
        hopsCierre.length > 0 ? 'si' : 'no',
        hopCierre?.fechaReal || '',
        usables[usables.length - 1].fecha_aprobacion,
        estadoFinal,
        confianza,
      ].join(',')
    );

    if (procesados % 200 === 0) console.log(`  ... ${procesados} folios procesados`);
  }

  fs.writeFileSync(CSV_SALIDA, csvFilas.join('\n') + '\n', 'utf8');
  fs.writeFileSync(JSON_SALIDA, JSON.stringify(resultados, null, 2), 'utf8');

  console.log('\n══════════ RESUMEN RECONCILIACIÓN ══════════');
  console.log(`Folios procesados: ${procesados}`);
  console.log(`  Con match de presentación (fecha+texto): ${conMatchPresentacion}`);
  console.log(`    Sin agenda real en esa fecha: ${sinAgendaPresentacion}`);
  console.log(`    Sin match de texto (agenda existe, ningún punto cuadra): ${sinMatchTexto}`);
  console.log(`  Con cadena real encontrada (Estudio/Dictamen): ${conCadenaReal}`);
  console.log(`    ... de las cuales vía expediente (bundling): ${viaExpedienteCount}`);
  console.log(`  Con cierre real encontrado: ${conCierre}`);
  console.log(`\nReporte: ${CSV_SALIDA}`);
  console.log(`Detalle: ${JSON_SALIDA}`);
  console.log('══════════════════════════════════════════\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✖ Error:', err);
    process.exit(1);
  });
