/**
 * Para los folios ya sembrados que dicen "Aprobada" en el Excel pero cuyo
 * cierre real no es alcanzable en la cadena actual (iniciativas_estudios que
 * YA reconstruí con reconstruir-cadena-v2.ts), busca el evento real de
 * Sesión en la Fecha de aprobación del Excel y — si encuentra un punto que
 * calza con confianza — AGREGA un nuevo eslabón de cierre (status "3") desde
 * la punta actual de la cadena de ese folio.
 *
 * SOLO AGREGA. Nunca borra ni toca los eslabones que ya existen (ni los del
 * backup, no se usa el backup aquí — fuente de verdad: el Excel).
 *
 * Uso: ts-node src/scripts/importar-historico/buscar-cierre-faltante.ts --commit
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Op } from 'sequelize';

import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativaEstudio from '../../models/iniciativas_estudio';
import ExpedienteEstudiosPuntos from '../../models/expedientes_estudio_puntos';
import PuntosOrden from '../../models/puntos_ordens';

import { buscarAgendasPorFecha } from './agendas-por-fecha';
import { cargarTipoEventosReales } from './catalogos';
import { elegirMejorCandidato, Candidato } from './matching-texto';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');
const REPORTE_PATH = path.resolve(__dirname, '../../data/reportes-import-historico/cierres-agregados.json');

/** BFS sobre la cadena actual: true si ya hay un status=3 alcanzable, si no, devuelve la frontera (puntas sin más salida) para colgar el cierre nuevo ahí. */
async function analizarCadena(puntoInicial: number): Promise<{ yaTieneCierre: boolean; frontera: number[] }> {
  const visitados = new Set<number>();
  let nivelActual = [puntoInicial];
  const hojas = new Set<number>([puntoInicial]);

  for (let profundidad = 0; profundidad < 6 && nivelActual.length > 0; profundidad++) {
    const siguienteNivel: number[] = [];
    for (const origen of nivelActual) {
      if (visitados.has(origen)) continue;
      visitados.add(origen);
      let tuvoHijos = false;

      const directos = await IniciativaEstudio.findAll({ where: { punto_origen_id: String(origen) } as any });
      for (const d of directos as any[]) {
        if (String(d.status) === '3') return { yaTieneCierre: true, frontera: [] };
        siguienteNivel.push(Number(d.punto_destino_id));
        tuvoHijos = true;
      }
      const expPuntos = await ExpedienteEstudiosPuntos.findAll({ where: { punto_origen_sesion_id: origen } as any });
      for (const ep of expPuntos as any[]) {
        const viaExp = await IniciativaEstudio.findAll({ where: { punto_origen_id: String(ep.expediente_id) } as any });
        for (const v of viaExp as any[]) {
          if (String(v.status) === '3') return { yaTieneCierre: true, frontera: [] };
          siguienteNivel.push(Number(v.punto_destino_id));
          tuvoHijos = true;
        }
      }
      if (tuvoHijos) hojas.delete(origen);
      for (const h of siguienteNivel) hojas.add(h);
    }
    nivelActual = siguienteNivel;
  }
  return { yaTieneCierre: false, frontera: [...hojas] };
}

async function main() {
  const commit = process.argv.includes('--commit');

  const filas: any[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const porFolio = new Map<string, any[]>();
  for (const f of filas) {
    if (!porFolio.has(f.folio)) porFolio.set(f.folio, []);
    porFolio.get(f.folio)!.push(f);
  }

  const { sesionId } = await cargarTipoEventosReales();
  const cacheAgendas = new Map<string, any[]>();

  const sembradas = await IniciativaPuntoOrden.findAll({ where: { folio_historico: { [Op.ne]: null } } as any });

  const reporte: any[] = [];
  let candidatos = 0;
  let encontrados = 0;
  let sinAgenda = 0;
  let sinMatchTexto = 0;

  for (const ini of sembradas as any[]) {
    if (ini.precluida === 1) continue;
    const puntoPresentacion = await PuntosOrden.findByPk(ini.id_punto);
    if ((puntoPresentacion as any)?.dispensa === 1) continue;

    const { yaTieneCierre, frontera } = await analizarCadena(Number(ini.id_punto));
    if (yaTieneCierre) continue;

    const filasFolio = porFolio.get(String(ini.folio_historico));
    if (!filasFolio) continue;
    const usables = filasFolio.filter((f: any) => !f.bandera.startsWith('Revisar'));
    if (usables.length === 0) continue;
    const estadoFinal = usables[usables.length - 1].estado;
    const fechaAprobacion = usables[usables.length - 1].fecha_aprobacion;
    if (estadoFinal !== 'Aprobada' || !fechaAprobacion) continue;

    candidatos++;

    let agendas = cacheAgendas.get(fechaAprobacion);
    if (!agendas) {
      agendas = await buscarAgendasPorFecha(fechaAprobacion, sesionId);
      cacheAgendas.set(fechaAprobacion, agendas);
    }
    if (agendas.length === 0) {
      sinAgenda++;
      reporte.push({ folio: ini.folio_historico, resultado: 'sin_agenda_real', fechaAprobacion });
      continue;
    }

    const puntosCandidatos: Candidato[] = [];
    for (const ag of agendas) {
      const puntos = await PuntosOrden.findAll({ where: { id_evento: (ag as any).id } as any });
      for (const p of puntos) puntosCandidatos.push({ id: (p as any).id, texto: (p as any).punto || '' });
    }

    const match = elegirMejorCandidato(usables[0].texto_iniciativa, puntosCandidatos);
    if (!match) {
      sinMatchTexto++;
      reporte.push({ folio: ini.folio_historico, resultado: 'sin_match_texto', fechaAprobacion, candidatos: puntosCandidatos.length });
      continue;
    }

    encontrados++;
    reporte.push({
      folio: ini.folio_historico,
      resultado: 'encontrado',
      fechaAprobacion,
      puntoCierre: match.puntoId,
      score: Number(match.score.toFixed(3)),
      frontera,
    });

    if (commit) {
      for (const origenId of frontera) {
        await IniciativaEstudio.create({ type: '1', punto_origen_id: origenId, punto_destino_id: match.puntoId, status: '3' });
      }
    }
  }

  fs.writeFileSync(REPORTE_PATH, JSON.stringify(reporte, null, 2), 'utf8');

  console.log('\n══════════ RESUMEN BÚSQUEDA DE CIERRE FALTANTE ══════════');
  console.log(`Candidatos (Aprobada, sin cierre): ${candidatos}`);
  console.log(`Cierre encontrado y agregado: ${encontrados}${commit ? '' : ' [DRY RUN, sin --commit]'}`);
  console.log(`Sin agenda real en fecha de aprobación: ${sinAgenda}`);
  console.log(`Agenda existe, texto no calza con confianza: ${sinMatchTexto}`);
  console.log(`\nReporte: ${REPORTE_PATH}`);
  console.log('═══════════════════════════════════════════════════════\n');
  if (!commit) console.log('Corre con --commit para escribir de verdad.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('✖ Error:', err);
  process.exit(1);
});
