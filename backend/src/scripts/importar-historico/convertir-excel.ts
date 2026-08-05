/**
 * Convierte la matriz histórica de iniciativas (xlsx) a un CSV normalizado
 * que el resto del pipeline de importación (catalogos/reporte/importar) consume.
 *
 * Uso: ts-node src/scripts/importar-historico/convertir-excel.ts [ruta-al-xlsx]
 * Por defecto lee del Excel entregado por el usuario y escribe en
 * backend/src/data/historico-iniciativas.csv
 */
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

const ORIGEN_DEFAULT = '/Users/martinsg/Documents/parlamentario/Matriz_simple (1).xlsx';
const DESTINO_CSV = path.resolve(__dirname, '../../data/historico-iniciativas.csv');

// Tokens que aparecen en las columnas de comisiones pero en realidad son notas
// de auditoría coladas al armar el Excel, no nombres de comisión reales.
const NOTA_NO_COMISION_PREFIJOS = ['en estudio', 'el dictamen'];

function esNotaNoComision(token: string): boolean {
  const t = token.toLowerCase();
  return NOTA_NO_COMISION_PREFIJOS.some((prefijo) => t.startsWith(prefijo));
}

function normalizarFecha(valor: string | null | undefined): string {
  if (!valor) return '';
  const v = valor.trim();
  if (!v || v.toUpperCase() === 'N/A') return '';
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return '';
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Separa SOLO por ';' (nunca aparece dentro de un nombre de comisión real) y
 * aparta las notas de auditoría coladas. NO se separa por ',' aquí: varios
 * nombres reales de comisión traen comas dentro del propio nombre (ej. "Salud,
 * Asistencia y Bienestar Social"), y a la vez ',' también se usa a veces como
 * separador entre comisiones distintas — esa ambigüedad solo se puede resolver
 * comparando contra el catálogo real, lo cual pasa después, en catalogos.ts.
 */
function limpiarComisiones(valor: string | null | undefined): { comisiones: string[]; notas: string[] } {
  if (!valor || valor.trim() === '' || valor.trim().toUpperCase() === 'N/A') {
    return { comisiones: [], notas: [] };
  }
  const tokens = valor
    .split(';')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const comisiones: string[] = [];
  const notas: string[] = [];
  for (const t of tokens) {
    // "Dispensa" es un valor centinela (la iniciativa se aprobó directo en
    // Sesión, sin turno a comisión), no un nombre de comisión real.
    if (t.trim().toLowerCase() === 'dispensa') continue;
    if (esNotaNoComision(t)) {
      notas.push(t);
    } else {
      comisiones.push(t);
    }
  }
  return { comisiones, notas };
}

function csvEscape(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

async function main() {
  const origen = process.argv[2] || ORIGEN_DEFAULT;
  if (!fs.existsSync(origen)) {
    throw new Error(`No se encontró el Excel de origen en: ${origen}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(origen);
  const hoja = workbook.worksheets[0];

  const headerRow = hoja.getRow(1);
  const columnas: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    columnas[String(cell.value).trim()] = colNumber;
  });

  const requeridas = [
    'Folio',
    'Texto de la iniciativa',
    'Autor',
    'Materia (referencia)',
    'Fecha de presentación',
    'Tipo de evento',
    'Fecha del evento',
    'Estado',
    'Comisiones turnadas',
    'Comisión en la reunión',
    'Bandera',
  ];
  for (const col of requeridas) {
    if (!columnas[col]) {
      throw new Error(`Falta la columna esperada "${col}" en el Excel de origen.`);
    }
  }

  const salida: string[] = [];
  salida.push(
    [
      'orden_fila',
      'folio',
      'texto_iniciativa',
      'autor',
      'materia',
      'fecha_presentacion',
      'tipo_evento',
      'fecha_evento',
      'estado',
      'comisiones_turnadas',
      'comisiones_turnadas_notas',
      'comision_reunion',
      'comision_reunion_notas',
      'bandera',
    ].join(',')
  );

  let filaOrden = 0;
  hoja.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const get = (col: string) => {
      const cell = row.getCell(columnas[col]);
      const v = cell.value;
      if (v === null || v === undefined) return '';
      if (typeof v === 'object' && 'text' in (v as any)) return String((v as any).text).trim();
      return String(v).trim();
    };

    const folio = get('Folio');
    if (!folio) return; // fila vacía

    filaOrden += 1;

    const turnadas = limpiarComisiones(get('Comisiones turnadas'));
    const reunion = limpiarComisiones(get('Comisión en la reunión'));

    salida.push(
      [
        String(filaOrden),
        folio,
        csvEscape(get('Texto de la iniciativa')),
        csvEscape(get('Autor')),
        csvEscape(get('Materia (referencia)')),
        normalizarFecha(get('Fecha de presentación')),
        get('Tipo de evento'),
        normalizarFecha(get('Fecha del evento')),
        get('Estado'),
        csvEscape(turnadas.comisiones.join('|')),
        csvEscape(turnadas.notas.join('|')),
        csvEscape(reunion.comisiones.join('|')),
        csvEscape(reunion.notas.join('|')),
        get('Bandera'),
      ].join(',')
    );
  });

  fs.mkdirSync(path.dirname(DESTINO_CSV), { recursive: true });
  fs.writeFileSync(DESTINO_CSV, salida.join('\n') + '\n', 'utf8');

  console.log(`✔ CSV generado: ${DESTINO_CSV}`);
  console.log(`  Filas escritas: ${filaOrden}`);
}

main().catch((err) => {
  console.error('✖ Error al convertir el Excel:', err.message);
  process.exit(1);
});
