/**
 * Cruza `adminplem_spid.datos_users.nombre_db` (76 filas, id_legislatura=2 =
 * LXII, es el nombre EXACTO tal como lo manda la capturadora) contra los 75
 * diputados activos de la LXII en `diputados` (legislativoConnection), y
 * puebla `diputados.nombre_captura` — SOLO para matches exactos normalizados
 * (mayúsculas, sin acentos, espacios colapsados). Los que no calzan exacto
 * se listan para decidir a mano, nunca se adivina.
 *
 * Uso:
 *   ts-node src/scripts/capturadora/cruzar-nombres-spid.ts            (reporte, no escribe)
 *   ts-node src/scripts/capturadora/cruzar-nombres-spid.ts --commit   (escribe los matches exactos)
 */
import { Sequelize, QueryTypes } from 'sequelize';
import legislativoConnection from '../../database/legislativoConnection';
import Diputado from '../../models/diputado';

const LXII_ID = '9b7dd670-6acc-11ef-aed9-5254e4a06850';

// Casos donde nombre_db (spid) trae apodo/nombre abreviado y no calza exacto
// contra el nombre legal completo — confirmados a mano con el usuario.
// "MARTIN SANCHEZ GONZALEZ" quedó fuera a propósito: confirmado que era un
// registro de prueba en spid, no corresponde a ningún diputado real.
const MAPEO_MANUAL: Record<string, string> = {
  'PABLO FERNANDEZ DE CEVALLOS G': 'PABLO FERNANDEZ DE CEVALLOS GONZALEZ',
  'KRISHNA ROMERO VELAZQUEZ': 'KRISHNA KARINA ROMERO VELAZQUEZ',
  'EMMA L ALVAREZ VILLAVICENCIO': 'EMMA LAURA ALVAREZ VILLAVICENCIO',
  'ALEXIA DAVILA': 'ROCIO ALEXIA DAVILA SANCHEZ',
  'MA MERCEDES COLIN GUADARRAMA': 'MARIA MERCEDES COLIN GUADARRAMA',
  'ISAAC HERNANDEZ MENDEZ': 'ISAAC JOSUE HERNANDEZ MENDEZ',
  'ANAI ESPARZA ACEVEDO': 'YARELI ANAI ESPARZA ACEVEDO',
  'OSCAR GONZALEZ YAÑEZ - OGY': 'OSCAR GONZALEZ YAÑEZ',
  'CONSUELO ESTRADA PLATA': 'MARIA DEL CONSUELO ESTRADA PLATA',
  'MARTHA A CAMACHO REYNOSO': 'MARTHA AZUCENA CAMACHO REYNOSO',
  'JOSE COUTTOLENC BUENTELLO': 'JOSE ALBERTO COUTTOLENC BUENTELLO',
  'JUAN ZEPEDA': 'JUAN MANUEL ZEPEDA HERNANDEZ',
  'SAMUEL RIOS MORENO': 'EDGAR SAMUEL RIOS MORENO',
  'LUIS VALDEÑA BASTIDA': 'EDMUNDO LUIS VALDEÑA BASTIDA',
  'DANIELA BALLESTEROS LULE': 'ITZEL DANIELA BALLESTEROS LULE',
  'ARLETH GRIMALDO OSORIO': 'ARLETH STEPHANIE GRIMALDO OSORIO',
  'SANDRA SANTOS RODRIGUEZ': 'SANDRA PATRICIA SANTOS RODRIGUEZ',
  'CARLOS ZURITA TREJO': 'CARLOS ANTONIO MARTINEZ ZURITA TREJO',
  'CARMEN DE LA ROSA MENDOZA': 'MARIA DEL CARMEN DE LA ROSA MENDOZA',
  'KARIM CARVALLO DELFIN': 'HECTOR KARIM CARVALLO DELFIN',
  'J FRANCISCO VAZQUEZ RODRIGUEZ': 'JOSE FRANCISCO VAZQUEZ RODRIGUEZ',
  'JENNIFER GONZALEZ LOPEZ': 'JENNIFER NATHALIE GONZALEZ LOPEZ',
  'ESMERALDA NAVARRO HERNANDEZ': 'LUISA ESMERALDA NAVARRO HERNANDEZ',
};

const spidConnection = new Sequelize('adminplem_spid', 'root', 'root', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

function normalizar(valor: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const commit = process.argv.includes('--commit');

  const filasSpid = await spidConnection.query(
    `SELECT nombre_completo, nombre_db FROM datos_users WHERE nombre_db IS NOT NULL AND id_legislatura = 2`,
    { type: QueryTypes.SELECT }
  ) as { nombre_completo: string; nombre_db: string }[];
  console.log(`Filas en adminplem_spid.datos_users con nombre_db (LXII): ${filasSpid.length}`);

  const [diputadosActivos]: any = await legislativoConnection.query(`
    SELECT d.id, d.apaterno, d.amaterno, d.nombres
    FROM diputados d
    INNER JOIN integrante_legislaturas il ON il.diputado_id = d.id
    WHERE il.legislatura_id = :lxii
      AND il.deleted_at IS NULL
      AND (il.fecha_fin IS NULL OR il.fecha_fin > CURDATE())
  `, { replacements: { lxii: LXII_ID } });
  console.log(`Diputados activos LXII: ${diputadosActivos.length}`);

  const porNombreNormalizado = new Map<string, any>();
  for (const d of diputadosActivos) {
    const clave = normalizar(`${d.nombres} ${d.apaterno} ${d.amaterno}`);
    porNombreNormalizado.set(clave, d);
  }

  const mapeoManualNormalizado = new Map<string, string>();
  for (const [k, v] of Object.entries(MAPEO_MANUAL)) {
    mapeoManualNormalizado.set(normalizar(k), normalizar(v));
  }

  const matches: { diputado: any; nombre_db: string }[] = [];
  const sinMatch: { nombre_completo: string; nombre_db: string; claveNormalizada: string }[] = [];
  const usados = new Set<string>();

  for (const fila of filasSpid) {
    const clave = normalizar(fila.nombre_db);
    let diputado = porNombreNormalizado.get(clave);

    if (!diputado && mapeoManualNormalizado.has(clave)) {
      diputado = porNombreNormalizado.get(mapeoManualNormalizado.get(clave)!);
    }

    if (diputado) {
      matches.push({ diputado, nombre_db: fila.nombre_db });
      usados.add(diputado.id);
    } else {
      sinMatch.push({ nombre_completo: fila.nombre_completo, nombre_db: fila.nombre_db, claveNormalizada: clave });
    }
  }

  const diputadosSinSpid = diputadosActivos.filter((d: any) => !usados.has(d.id));

  console.log(`\n══════════ RESUMEN CRUCE ══════════`);
  console.log(`Matches exactos: ${matches.length}`);
  console.log(`Filas de spid SIN match exacto: ${sinMatch.length}`);
  console.log(`Diputados activos SIN fila de spid: ${diputadosSinSpid.length}`);

  if (sinMatch.length > 0) {
    console.log(`\n--- Sin match (spid) — revisar a mano ---`);
    for (const s of sinMatch) console.log(`  "${s.nombre_db}"  (nombre_completo: "${s.nombre_completo}")`);
  }
  if (diputadosSinSpid.length > 0) {
    console.log(`\n--- Diputados LXII sin fila de spid — revisar a mano ---`);
    for (const d of diputadosSinSpid) console.log(`  ${d.nombres} ${d.apaterno} ${d.amaterno}`);
  }

  if (commit) {
    for (const m of matches) {
      await Diputado.update({ nombre_captura: m.nombre_db } as any, { where: { id: m.diputado.id } as any });
    }
    console.log(`\n✔ nombre_captura poblado para ${matches.length} diputados.`);
  } else {
    console.log(`\nCorre con --commit para escribir los ${matches.length} matches exactos.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Error:', err);
  process.exit(1);
});
