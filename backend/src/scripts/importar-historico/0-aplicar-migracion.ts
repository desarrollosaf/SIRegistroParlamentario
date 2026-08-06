/**
 * Aplica las migraciones del import histórico usando la MISMA conexión que
 * usa la app en runtime (database/registrocomisiones.ts).
 *
 * OJO: `npx sequelize-cli db:migrate` NO sirve en este proyecto — su
 * src/config/config.json apunta a una base "registrocomisiones" que no es
 * ninguna de las bases reales (adminplem_siregistroparlamentario /
 * adminplem_congresoedomex). Por eso este runner manual.
 *
 * Seguro de correr varias veces: cada migración se salta si su columna ya existe.
 *
 * Uso: ts-node src/scripts/importar-historico/0-aplicar-migracion.ts
 */
import sequelize from '../../database/registrocomisiones';

const MIGRACIONES: { archivo: string; columna: string }[] = [
  { archivo: '20260804120000-add-folio-historico-to-iniciativas-puntos-ordens.js', columna: 'folio_historico' },
  { archivo: '20260805200000-add-folios-agrupados-to-iniciativas-puntos-ordens.js', columna: 'folios_agrupados' },
];

async function main() {
  const qi = sequelize.getQueryInterface();
  const tabla = await qi.describeTable('inciativas_puntos_ordens');

  for (const m of MIGRACIONES) {
    if (tabla[m.columna]) {
      console.log(`La columna ${m.columna} ya existe. Se salta.`);
      continue;
    }
    const migracion = require(`../../migrations/${m.archivo}`);
    console.log(`Aplicando ${m.archivo}...`);
    await migracion.up(qi, sequelize.constructor);
    console.log(`✔ Columna ${m.columna} creada.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Error aplicando migración:', err);
  process.exit(1);
});
