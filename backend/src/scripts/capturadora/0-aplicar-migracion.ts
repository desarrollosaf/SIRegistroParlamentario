/**
 * Aplica add-nombre-captura-to-diputados usando la conexión legislativoConnection
 * (diputados vive en adminplem_congresoedomex, no en la BD de registrocomisiones).
 * Seguro de correr más de una vez: se salta si la columna ya existe.
 *
 * Uso: ts-node src/scripts/capturadora/0-aplicar-migracion.ts
 */
import sequelize from '../../database/legislativoConnection';

const migracion = require('../../migrations/20260807120000-add-nombre-captura-to-diputados.js');

async function main() {
  const qi = sequelize.getQueryInterface();
  const tabla = await qi.describeTable('diputados');

  if (tabla['nombre_captura']) {
    console.log('La columna nombre_captura ya existe. Nada que hacer.');
    process.exit(0);
  }

  console.log('Aplicando migración...');
  await migracion.up(qi, sequelize.constructor);
  console.log('✔ Columna nombre_captura creada en diputados.');
  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Error aplicando migración:', err);
  process.exit(1);
});
