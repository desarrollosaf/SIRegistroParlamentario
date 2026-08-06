/**
 * Tras corregir el bug de fecha (TIMESTAMP con hora), reconciliar.ts encontró
 * más matches de presentación (931 vs 736 antes). Este script solo crea las
 * iniciativas que faltan (las que ya existen de la corrida anterior se
 * dejan intactas) — mismo patrón que sembrar-completo.ts pero idempotente.
 *
 * Uso: ts-node src/scripts/importar-historico/sembrar-nuevos-matches.ts --commit
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

import PuntosOrden from '../../models/puntos_ordens';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';

import { cargarCatalogosComisionesYProponentes, resolverComision, tokenizarBloqueComisiones, Catalogos } from './catalogos';
import { clasificarAutor } from './clasificar-autor';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');
const JSON_RECONCILIACION = path.resolve(__dirname, '../../data/reportes-import-historico/reconciliacion.json');

function limpiarTexto(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return valor.normalize('NFC').replace(/[̀-ͯ]/g, '');
}
function truncar(valor: string, maxLargo: number): string {
  return valor.length > maxLargo ? valor.slice(0, maxLargo - 1) + '…' : valor;
}
function resolverComisionesDeCelda(celdaConBloques: string, catalogo: Catalogos): string[] {
  if (!celdaConBloques) return [];
  const ids = new Set<string>();
  for (const bloque of celdaConBloques.split('|').filter(Boolean)) {
    for (const nombre of tokenizarBloqueComisiones(bloque, catalogo)) {
      const encontrada = resolverComision(nombre, catalogo);
      if (encontrada) ids.add(encontrada.id);
    }
  }
  return [...ids];
}

async function main() {
  const commit = process.argv.includes('--commit');
  if (!commit) {
    console.log('Corre con --commit para escribir.');
    process.exit(0);
  }

  const filas: any[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const porFolio = new Map<string, any[]>();
  for (const f of filas) {
    if (!porFolio.has(f.folio)) porFolio.set(f.folio, []);
    porFolio.get(f.folio)!.push(f);
  }

  const reconciliacion: any[] = JSON.parse(fs.readFileSync(JSON_RECONCILIACION, 'utf8'));
  const conMatch = reconciliacion.filter((r) => r.matchPresentacion);
  console.log(`Folios con match de presentación: ${conMatch.length}`);

  const catalogo = await cargarCatalogosComisionesYProponentes();

  let creadas = 0;
  let yaExistian = 0;
  let errores = 0;

  for (const r of conMatch) {
    const filasFolio = porFolio.get(r.folio);
    if (!filasFolio) continue;
    const usables = filasFolio.filter((f: any) => !f.bandera.startsWith('Revisar'));
    if (usables.length === 0) continue;
    const primeraFila = usables[0];

    const puntoId = r.matchPresentacion.puntoId;
    const agendaId = r.matchPresentacion.agendaId;

    const yaExiste = await IniciativaPuntoOrden.findOne({ where: { id_punto: puntoId } as any });
    if (yaExiste) {
      yaExistian++;
      if (!(yaExiste as any).folio_historico) {
        await yaExiste.update({ folio_historico: Number(r.folio) } as any);
      }
      continue;
    }

    try {
      const estadoFinal = usables[usables.length - 1].estado;
      const nuevaIniciativa = await IniciativaPuntoOrden.create({
        id_punto: puntoId,
        id_evento: agendaId,
        iniciativa: limpiarTexto(primeraFila.texto_iniciativa),
        status: null,
        precluida: estadoFinal === 'Precluida' ? 1 : null,
        publico: 0,
        folio_historico: Number(r.folio),
      } as any);

      const clasif = clasificarAutor(primeraFila.autor, catalogo);
      await IniciativasPresenta.create({
        id_iniciativa: nuevaIniciativa.id,
        id_tipo_presenta: clasif.tipoPresentaId,
        id_presenta: truncar(limpiarTexto(primeraFila.autor) || '', 255),
      } as any);

      const comisionIds = resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo).length
        ? resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo)
        : resolverComisionesDeCelda(primeraFila.comision_reunion, catalogo);
      if (comisionIds.length > 0) {
        await PuntosComisiones.create({ id_punto: puntoId, id_comision: `[${comisionIds.join(',')}]` } as any);
        await PuntosOrden.update({ se_turna_comision: 1 }, { where: { id: puntoId } as any });
      }

      creadas++;
    } catch (err: any) {
      errores++;
      console.error(`✖ Folio ${r.folio}: ${err.message}`);
    }
  }

  console.log('\n══════════ RESUMEN ══════════');
  console.log(`Iniciativas nuevas creadas: ${creadas}`);
  console.log(`Ya existían: ${yaExistian}`);
  console.log(`Errores: ${errores}`);
  console.log('══════════════════════════════\n');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
