/**
 * Re-siembra inciativas_puntos_ordens / iniciativas_presenta /
 * puntos_comisiones / iniciativas_estudios usando el mapeo exportado por
 * exportar-mapeo.ts — es decir, reconstruye todo apuntando A LOS MISMOS
 * agendas y puntos_ordens que ya existían (no crea ninguno nuevo).
 *
 * Requiere: haber corrido borrar-historico.ts antes (o al menos que no
 * existan ya inciativas_puntos_ordens con esos folio_historico).
 *
 * Uso: ts-node src/scripts/importar-historico/resembrar-desde-mapeo.ts --commit
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

import sequelize from '../../database/registrocomisiones';
import PuntosOrden from '../../models/puntos_ordens';
import IniciativaPuntoOrden from '../../models/inciativas_puntos_ordens';
import IniciativasPresenta from '../../models/iniciativaspresenta';
import PuntosComisiones from '../../models/puntos_comisiones';
import IniciativaEstudio from '../../models/iniciativas_estudio';

import { cargarCatalogos, resolverComision, tokenizarBloqueComisiones, Catalogos } from './catalogos';
import { clasificarAutor } from './clasificar-autor';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');
const MAPEO_PATH = path.resolve(__dirname, '../../data/mapeo-puntos-historico.json');

interface FilaCsv {
  folio: string;
  texto_iniciativa: string;
  autor: string;
  materia: string;
  fecha_presentacion: string;
  tipo_evento: string;
  fecha_evento: string;
  estado: string;
  comisiones_turnadas: string;
  comision_reunion: string;
  bandera: string;
}

interface Paso { puntoId: number; status: string; esCierre: boolean }
interface MapeoFolio { folio: number; puntoPresentacionId: string; sesionAgendaId: string; pasos: Paso[] }

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
    console.log('Corre con --commit para escribir. Sin esa bandera esto no hace nada.');
    process.exit(0);
  }

  const filas: FilaCsv[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), { columns: true, skip_empty_lines: true });
  const mapeo: MapeoFolio[] = JSON.parse(fs.readFileSync(MAPEO_PATH, 'utf8'));
  const mapeoPorFolio = new Map<number, MapeoFolio>(mapeo.map((m) => [m.folio, m]));

  const catalogo = await cargarCatalogos();

  const folios = new Map<string, FilaCsv[]>();
  for (const fila of filas) {
    if (!folios.has(fila.folio)) folios.set(fila.folio, []);
    folios.get(fila.folio)!.push(fila);
  }

  let creados = 0;
  let sinMapeo = 0;
  let errores = 0;

  for (const [folioStr, filasFolio] of folios) {
    const folioNum = Number(folioStr);
    const usables = filasFolio.filter((f) => !f.bandera.startsWith('Revisar'));
    if (usables.length === 0) continue;

    const m = mapeoPorFolio.get(folioNum);
    if (!m) {
      sinMapeo++;
      continue; // folio que en la siembra original no se sembró (ej. estaba en "Revisar")
    }

    const primeraFila = usables[0];
    const estadoFinal = usables[usables.length - 1].estado;

    try {
      await sequelize.transaction(async (t) => {
        const iniciativaPO = await IniciativaPuntoOrden.create(
          {
            id_punto: Number(m.puntoPresentacionId),
            id_evento: m.sesionAgendaId,
            iniciativa: limpiarTexto(primeraFila.texto_iniciativa),
            status: null,
            precluida: estadoFinal === 'Precluida' ? 1 : null,
            publico: 0,
            folio_historico: folioNum,
          },
          { transaction: t }
        );

        const clasif = clasificarAutor(primeraFila.autor, catalogo);
        await IniciativasPresenta.create(
          {
            id_iniciativa: iniciativaPO.id,
            id_tipo_presenta: clasif.tipoPresentaId,
            id_presenta: truncar(limpiarTexto(primeraFila.autor) || '', 255),
          },
          { transaction: t }
        );

        const comisionIds = resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo).length
          ? resolverComisionesDeCelda(primeraFila.comisiones_turnadas, catalogo)
          : resolverComisionesDeCelda(primeraFila.comision_reunion, catalogo);

        if (comisionIds.length > 0) {
          await PuntosComisiones.create(
            { id_punto: Number(m.puntoPresentacionId), id_comision: `[${comisionIds.join(',')}]` },
            { transaction: t }
          );
          await PuntosOrden.update(
            { se_turna_comision: 1 },
            { where: { id: Number(m.puntoPresentacionId) }, transaction: t }
          );
        }

        let origenId = Number(m.puntoPresentacionId);
        for (const paso of m.pasos) {
          await IniciativaEstudio.create(
            { type: '1', punto_origen_id: origenId, punto_destino_id: paso.puntoId, status: paso.status },
            { transaction: t }
          );
          if (!paso.esCierre) origenId = paso.puntoId;
        }
      });
      creados++;
      if (creados % 200 === 0) console.log(`  ... ${creados} folios re-sembrados`);
    } catch (err: any) {
      errores++;
      console.error(`✖ Folio ${folioStr}: ${err.message}`);
    }
  }

  console.log('\n══════════ RESUMEN RE-SIEMBRA ══════════');
  console.log(`Folios re-sembrados: ${creados}`);
  console.log(`Folios sin mapeo previo (no se sembraron): ${sinMapeo}`);
  console.log(`Errores: ${errores}`);
  console.log('══════════════════════════════════════\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✖ Error fatal:', err);
    process.exit(1);
  });
