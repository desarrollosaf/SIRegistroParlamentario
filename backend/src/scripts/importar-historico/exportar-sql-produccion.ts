/**
 * Exporta, como SQL portable, EXACTAMENTE lo que esta sesión creó/modificó
 * en la BD clon — para aplicarlo directo en producción (mismos IDs de
 * agendas/puntos_ordens, al ser copia de producción) SIN volver a correr el
 * matching de texto allá (evita que dé un resultado distinto).
 *
 * Cubre:
 *  - inciativas_puntos_ordens: UPDATE folio_historico en las que YA existían
 *    (createdAt anterior a hoy), INSERT completo en las que se crearon hoy.
 *  - iniciativas_presenta / puntos_comisiones: INSERT de lo creado hoy.
 *  - iniciativas_estudios / expedientes / expedientes_estudio_puntos: INSERT
 *    de TODO (esta sesión vació y reconstruyó estas 3 tablas por completo).
 *  - puntos_ordens: UPDATE de id_dictamen / se_turna_comision donde se tocó.
 *
 * No incluye nada de `agendas` ni creación de `puntos_ordens` — nunca se
 * crearon, solo se referenciaron/actualizaron los que ya existían.
 *
 * Uso: ts-node src/scripts/importar-historico/exportar-sql-produccion.ts
 * Salida: backend/src/data/reportes-import-historico/migrar-a-produccion.sql
 */
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import sequelize from '../../database/registrocomisiones';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';
import IniciativaEstudio from '../../models/iniciativas_estudio';
import Expediente from '../../models/expediente';
import ExpedienteEstudiosPuntos from '../../models/expedientes_estudio_puntos';
import PuntosOrden from '../../models/puntos_ordens';

const SALIDA = path.resolve(__dirname, '../../data/reportes-import-historico/migrar-a-produccion.sql');

// Todo lo de esta sesión se creó hoy; los reales preexistentes son de meses
// atrás (verificado: nada real tiene createdAt en este rango). Ajustar si
// se vuelve a correr otro día.
const CORTE_HOY = '2026-08-05 00:00:00';

function esc(v: any): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

async function main() {
  const lineas: string[] = [];
  lineas.push('-- Generado por exportar-sql-produccion.ts — revisar antes de correr.');
  lineas.push('-- Aplicar dentro de una transacción; hacer respaldo antes.');
  lineas.push('START TRANSACTION;');
  lineas.push('');

  // 1) inciativas_puntos_ordens (incluye folio_historico no nulo -las del
  // Excel- y tipo 2/3 -Minutas/Puntos de Acuerdo del backup, sin folio-)
  const inis = await IniciativaPuntoOrden.findAll({
    where: { [Op.or]: [{ folio_historico: { [Op.ne]: null } }, { tipo: { [Op.in]: [2, 3] } }] } as any,
  });
  let nuevas = 0, actualizadas = 0;
  const idsNuevas = new Set<string>();

  lineas.push('-- === inciativas_puntos_ordens ===');
  for (const i of inis as any[]) {
    const esNueva = new Date(i.createdAt) >= new Date(CORTE_HOY);
    if (esNueva) {
      idsNuevas.add(i.id);
      nuevas++;
      lineas.push(
        `INSERT INTO inciativas_puntos_ordens (id, id_punto, id_sap, id_evento, iniciativa, tipo, fecha_votacion, status, expediente, path_doc, precluida, publico, folio_historico, folios_agrupados, createdAt, updatedAt, deletedAt) VALUES (${esc(i.id)}, ${esc(i.id_punto)}, ${esc(i.id_sap)}, ${esc(i.id_evento)}, ${esc(i.iniciativa)}, ${esc(i.tipo)}, ${esc(i.fecha_votacion)}, ${esc(i.status)}, ${esc(i.expediente)}, ${esc(i.path_doc)}, ${esc(i.precluida)}, ${esc(i.publico)}, ${esc(i.folio_historico)}, ${esc(i.folios_agrupados)}, ${esc(i.createdAt)}, ${esc(i.updatedAt)}, ${esc(i.deletedAt)});`
      );
    } else {
      actualizadas++;
      lineas.push(`UPDATE inciativas_puntos_ordens SET folio_historico = ${esc(i.folio_historico)}, folios_agrupados = ${esc(i.folios_agrupados)} WHERE id = ${esc(i.id)};`);
    }
  }
  lineas.push('');

  // 2) iniciativas_presenta (solo las de iniciativas nuevas)
  lineas.push('-- === iniciativas_presenta (solo de iniciativas nuevas) ===');
  let presentaCount = 0;
  for (const idIni of idsNuevas) {
    const presenta = await IniciativasPresenta.findAll({ where: { id_iniciativa: idIni } as any });
    for (const p of presenta as any[]) {
      presentaCount++;
      lineas.push(
        `INSERT INTO iniciativas_presenta (id, id_iniciativa, id_tipo_presenta, id_presenta, createdAt, updatedAt, deletedAt) VALUES (${esc(p.id)}, ${esc(p.id_iniciativa)}, ${esc(p.id_tipo_presenta)}, ${esc(p.id_presenta)}, ${esc(p.createdAt)}, ${esc(p.updatedAt)}, ${esc(p.deletedAt)});`
      );
    }
  }
  lineas.push('');

  // 3) puntos_comisiones creadas hoy
  lineas.push('-- === puntos_comisiones (creadas hoy) ===');
  const comisiones = await PuntosComisiones.findAll({ where: { createdAt: { [Op.gte]: CORTE_HOY } } as any });
  for (const c of comisiones as any[]) {
    lineas.push(
      `INSERT INTO puntos_comisiones (id, id_punto, id_comision, id_punto_turno, createdAt, updatedAt) VALUES (${esc(c.id)}, ${esc(c.id_punto)}, ${esc(c.id_comision)}, ${esc(c.id_punto_turno)}, ${esc(c.createdAt)}, ${esc(c.updatedAt)});`
    );
  }
  lineas.push('');

  // 4) iniciativas_estudios (TODAS son de esta sesión)
  lineas.push('-- === iniciativas_estudios (reconstruidas completas) ===');
  const estudios = await IniciativaEstudio.findAll();
  for (const e of estudios as any[]) {
    lineas.push(
      `INSERT INTO iniciativas_estudios (id, type, punto_origen_id, punto_destino_id, status, createdAt, updatedAt, deletedAt) VALUES (${esc(e.id)}, ${esc(e.type)}, ${esc(e.punto_origen_id)}, ${esc(e.punto_destino_id)}, ${esc(e.status)}, ${esc(e.createdAt)}, ${esc(e.updatedAt)}, ${esc(e.deletedAt)});`
    );
  }
  lineas.push('');

  // 5) expedientes + expedientes_estudio_puntos (TODOS de esta sesión)
  lineas.push('-- === expedientes (reconstruidos completos) ===');
  const expedientes = await Expediente.findAll();
  for (const ex of expedientes as any[]) {
    lineas.push(
      `INSERT INTO expedientes (id, evento_comision_id, descripcion, createdAt, updatedAt) VALUES (${esc(ex.id)}, ${esc(ex.evento_comision_id)}, ${esc(ex.descripcion)}, ${esc(ex.createdAt)}, ${esc(ex.updatedAt)});`
    );
  }
  lineas.push('');
  lineas.push('-- === expedientes_estudio_puntos ===');
  const expPuntos = await ExpedienteEstudiosPuntos.findAll();
  for (const ep of expPuntos as any[]) {
    lineas.push(
      `INSERT INTO expedientes_estudio_puntos (id, expediente_id, punto_origen_sesion_id, createdAt, updatedAt) VALUES (${esc(ep.id)}, ${esc(ep.expediente_id)}, ${esc(ep.punto_origen_sesion_id)}, ${esc(ep.createdAt)}, ${esc(ep.updatedAt)});`
    );
  }
  lineas.push('');

  // 6) puntos_ordens: id_dictamen / se_turna_comision — SOLO en los puntos que
  // esta sesión realmente tocó (presentación de folios + destinos de las
  // aristas reconstruidas). Nunca se debe tomar "todo lo que tenga el campo
  // en true", porque eso incluye datos reales preexistentes sin relación
  // con este trabajo.
  const puntosPresentacion = inis.map((i: any) => Number(i.id_punto));
  const puntosDestino = (estudios as any[]).map((e: any) => Number(e.punto_destino_id));
  const puntosTocados = [...new Set([...puntosPresentacion, ...puntosDestino])];

  lineas.push('-- === puntos_ordens (solo campos tocados: id_dictamen, se_turna_comision) ===');
  const puntosConDictamen = await PuntosOrden.findAll({
    where: { id: { [Op.in]: puntosTocados }, id_dictamen: { [Op.ne]: null } } as any,
  });
  for (const p of puntosConDictamen as any[]) {
    lineas.push(`UPDATE puntos_ordens SET id_dictamen = ${esc(p.id_dictamen)} WHERE id = ${esc(p.id)};`);
  }
  const puntosTurnados = await PuntosOrden.findAll({
    where: { id: { [Op.in]: puntosTocados }, se_turna_comision: 1 } as any,
  });
  for (const p of puntosTurnados as any[]) {
    lineas.push(`UPDATE puntos_ordens SET se_turna_comision = 1 WHERE id = ${esc(p.id)};`);
  }
  lineas.push('');

  // 7) dispensa: 4 puntos Dispensa reales cuyo flag faltaba (investigado
  // manualmente, confirmado por texto+fecha contra el Excel).
  lineas.push('-- === puntos_ordens.dispensa (4 casos confirmados manualmente) ===');
  const PUNTOS_DISPENSA_CONFIRMADOS = [2661, 3139, 3140, 3141];
  for (const id of PUNTOS_DISPENSA_CONFIRMADOS) {
    lineas.push(`UPDATE puntos_ordens SET dispensa = 1 WHERE id = ${id};`);
  }
  lineas.push('');

  lineas.push('COMMIT;');

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, lineas.join('\n') + '\n', 'utf8');

  console.log('\n══════════ RESUMEN EXPORT SQL ══════════');
  console.log(`inciativas_puntos_ordens nuevas (INSERT): ${nuevas}`);
  console.log(`inciativas_puntos_ordens existentes (UPDATE folio_historico): ${actualizadas}`);
  console.log(`iniciativas_presenta (INSERT): ${presentaCount}`);
  console.log(`puntos_comisiones (INSERT): ${comisiones.length}`);
  console.log(`iniciativas_estudios (INSERT): ${estudios.length}`);
  console.log(`expedientes (INSERT): ${expedientes.length}`);
  console.log(`expedientes_estudio_puntos (INSERT): ${expPuntos.length}`);
  console.log(`puntos_ordens con id_dictamen (UPDATE): ${puntosConDictamen.length}`);
  console.log(`puntos_ordens con se_turna_comision (UPDATE): ${puntosTurnados.length}`);
  console.log(`\nArchivo: ${SALIDA}`);
  console.log('══════════════════════════════════════\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Error:', err);
  process.exit(1);
});
