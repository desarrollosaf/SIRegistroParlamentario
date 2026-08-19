// Aplica UNA sola migración de Sequelize directamente, sin correr las demás
// (útil cuando hay otra migración pendiente con error que bloquea "db:migrate").
//
// Uso, desde la carpeta backend:
//   node scripts/run-single-migration.js 20260819120000-add-index-votos-punto.js

const path = require("path");
const { Sequelize } = require("sequelize");

const fileName = process.argv[2];
if (!fileName) {
  console.error("Uso: node scripts/run-single-migration.js <archivo-migracion.js>");
  process.exit(1);
}

const config = require("../src/config/config.json")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});

async function main() {
  const queryInterface = sequelize.getQueryInterface();
  const migrationPath = path.join(__dirname, "..", "src", "migrations", fileName);
  const migration = require(migrationPath);

  await migration.up(queryInterface, Sequelize);
  console.log(`Migración aplicada: ${fileName}`);

  // La registra en SequelizeMeta para que un futuro "db:migrate" normal
  // no intente volver a correrla (y no truene por "el índice ya existe").
  await sequelize.query("INSERT IGNORE INTO `SequelizeMeta` (`name`) VALUES (?)", {
    replacements: [fileName],
  });
  console.log("Registrada en SequelizeMeta.");

  await sequelize.close();
}

main().catch((err) => {
  console.error("Error al aplicar la migración:", err);
  process.exit(1);
});
