/**
 * Reporte en seco (dry-run) de la importación histórica: NO escribe nada en
 * la BD. Lee el CSV generado por convertir-excel.ts, agrupa por folio,
 * resuelve comisiones y autores contra los catálogos reales, y muestra qué
 * tan lista está la data para sembrarse.
 *
 * Uso: ts-node src/scripts/importar-historico/reporte.ts
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { cargarCatalogos, resolverComision, tokenizarBloqueComisiones } from './catalogos';
import { clasificarAutor } from './clasificar-autor';

const CSV_PATH = path.resolve(__dirname, '../../data/historico-iniciativas.csv');
const DIR_REPORTES = path.resolve(__dirname, '../../data/reportes-import-historico');

interface FilaCsv {
  orden_fila: string;
  folio: string;
  texto_iniciativa: string;
  autor: string;
  materia: string;
  fecha_presentacion: string;
  tipo_evento: string;
  fecha_evento: string;
  estado: string;
  comisiones_turnadas: string;
  comisiones_turnadas_notas: string;
  comision_reunion: string;
  comision_reunion_notas: string;
  bandera: string;
}

function escribirCsvSimple(rutaArchivo: string, filas: string[][]) {
  const contenido = filas
    .map((fila) => fila.map((v) => (v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v)).join(','))
    .join('\n');
  fs.writeFileSync(rutaArchivo, contenido + '\n', 'utf8');
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No existe ${CSV_PATH}. Corre primero convertir-excel.ts`);
  }
  fs.mkdirSync(DIR_REPORTES, { recursive: true });

  const filas: FilaCsv[] = parse(fs.readFileSync(CSV_PATH, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`CSV leído: ${filas.length} filas.`);

  const catalogo = await cargarCatalogos();
  console.log(`Sede a usar: "${catalogo.sedeNombre}" (${catalogo.sedeId})`);
  console.log(`Tipo evento Sesión: ${catalogo.tipoEventoSesionId}`);
  console.log(`Tipo evento Comisión: ${catalogo.tipoEventoComisionId}`);
  console.log(`Comisiones en catálogo: ${catalogo.comisionesPorNombre.size}`);
  console.log(`Proponentes en catálogo: ${catalogo.proponentesPorNombre.size}`);
  console.log('');

  const folios = new Map<string, FilaCsv[]>();
  for (const fila of filas) {
    if (!folios.has(fila.folio)) folios.set(fila.folio, []);
    folios.get(fila.folio)!.push(fila);
  }

  const comisionesSinMatch = new Map<string, number>();
  const autoresSinClasificar = new Map<string, number>();
  const filasRevisar: FilaCsv[] = [];
  let filasSinReunion = 0;
  let filasConEvento = 0;

  const estadoPorFolio = new Map<string, string>();

  for (const fila of filas) {
    if (fila.bandera.startsWith('Revisar')) {
      filasRevisar.push(fila);
      continue; // no se evalúa más a fondo, ya va a revisión manual
    }

    if (fila.tipo_evento === 'Sin reunión registrada') {
      filasSinReunion++;
    } else {
      filasConEvento++;
    }

    estadoPorFolio.set(fila.folio, fila.estado);

    for (const col of [fila.comisiones_turnadas, fila.comision_reunion]) {
      if (!col) continue;
      for (const bloque of col.split('|').filter(Boolean)) {
        for (const nombre of tokenizarBloqueComisiones(bloque, catalogo)) {
          if (!resolverComision(nombre, catalogo)) {
            comisionesSinMatch.set(nombre, (comisionesSinMatch.get(nombre) || 0) + 1);
          }
        }
      }
    }

    const clasif = clasificarAutor(fila.autor, catalogo);
    if (!clasif.tipoPresentaId) {
      autoresSinClasificar.set(fila.autor, (autoresSinClasificar.get(fila.autor) || 0) + 1);
    }
  }

  const conteoEstados = new Map<string, number>();
  for (const estado of estadoPorFolio.values()) {
    conteoEstados.set(estado, (conteoEstados.get(estado) || 0) + 1);
  }

  console.log('══════════ REPORTE EN SECO — IMPORTACIÓN HISTÓRICA ══════════\n');
  console.log(`Folios (iniciativas) únicos totales: ${folios.size}`);
  console.log(`Filas excluidas por Bandera "Revisar": ${filasRevisar.length}`);
  console.log(`Filas con evento real (Estudio/Dictamen/Dispensa): ${filasConEvento}`);
  console.log(`Filas "Sin reunión registrada": ${filasSinReunion}`);
  console.log('');
  console.log('Folios a sembrar por estado final (excluyendo los marcados "Revisar"):');
  for (const [estado, n] of conteoEstados) {
    console.log(`  - ${estado}: ${n}`);
  }
  console.log('');
  console.log(`Comisiones sin match en catálogo (${comisionesSinMatch.size} nombres distintos):`);
  for (const [nombre, n] of [...comisionesSinMatch.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  - "${nombre}" (${n} filas)`);
  }
  console.log('');
  console.log(`Autores sin clasificar contra el catálogo de proponentes (${autoresSinClasificar.size} distintos):`);
  for (const [nombre, n] of [...autoresSinClasificar.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
    console.log(`  - "${nombre}" (${n} filas)`);
  }
  if (autoresSinClasificar.size > 30) {
    console.log(`  ... y ${autoresSinClasificar.size - 30} más (ver CSV completo)`);
  }
  console.log('\n════════════════════════════════════════════════════════════\n');

  // Reportes en CSV para revisión detallada
  escribirCsvSimple(
    path.join(DIR_REPORTES, 'comisiones-sin-match.csv'),
    [['comision_excel', 'ocurrencias'], ...[...comisionesSinMatch.entries()].map(([k, v]) => [k, String(v)])]
  );
  escribirCsvSimple(
    path.join(DIR_REPORTES, 'autores-sin-clasificar.csv'),
    [['autor_excel', 'ocurrencias'], ...[...autoresSinClasificar.entries()].map(([k, v]) => [k, String(v)])]
  );
  escribirCsvSimple(
    path.join(DIR_REPORTES, 'filas-revisar.csv'),
    [
      ['folio', 'bandera', 'tipo_evento', 'fecha_evento', 'texto_iniciativa'],
      ...filasRevisar.map((f) => [f.folio, f.bandera, f.tipo_evento, f.fecha_evento, f.texto_iniciativa]),
    ]
  );

  console.log(`Reportes detallados escritos en: ${DIR_REPORTES}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✖ Error generando el reporte:', err.message);
    process.exit(1);
  });
