/**
 * Prepara la BD LOCAL: crea las tablas que falten a partir de los modelos y un
 * usuario de prueba. Nunca modifica ni borra tablas existentes, así que también
 * es seguro correrlo después de importar datos propios con DBeaver.
 *
 * Las migraciones no sirven para esto: alteran tablas (p. ej. agendas) que
 * ninguna migración crea. Tampoco se crean llaves foráneas, porque algunas
 * cruzan de una base a otra.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const nombres = ['DB_NAME_SAF', 'DB_NAME_LEGISLATIVO', 'DB_NAME_REGISTROCOMISIONES', 'DB_NAME_PLENO'];
if (
  process.env.DB_HOST !== 'db' ||
  process.env.DB_HOST_PLENO !== 'db' ||
  !nombres.every((n) => (process.env[n] || '').startsWith('local_'))
) {
  console.error('[preparar-bd] Esto no apunta a la BD local. No se hace nada.');
  process.exit(1);
}

const DIST = path.join(__dirname, 'dist');
const IGNORAR = new Set(['server.js', 'init-models.js']);

async function main() {
  let omitidos = 0;
  for (const archivo of fs.readdirSync(path.join(DIST, 'models'))) {
    if (!archivo.endsWith('.js') || IGNORAR.has(archivo)) continue;
    try {
      require(path.join(DIST, 'models', archivo));
    } catch (err) {
      omitidos++;
      console.warn(`[preparar-bd] Modelo omitido ${archivo}: ${err.message}`);
    }
  }

  const conexiones = ['connection', 'legislativoConnection', 'registrocomisiones', 'pleno'];
  let creadas = 0;
  let fallidas = 0;
  for (const nombre of conexiones) {
    const sequelize = require(path.join(DIST, 'database', nombre)).default;
    await sequelize.authenticate();
    for (const modelo of Object.values(sequelize.models)) {
      try {
        for (const atributo of Object.values(modelo.rawAttributes)) delete atributo.references;
        modelo.refreshAttributes();
        await modelo.sync();
        creadas++;
      } catch (err) {
        fallidas++;
        console.warn(`[preparar-bd] ${nombre}.${modelo.tableName}: ${err.message}`);
      }
    }
  }
  console.log(`[preparar-bd] Tablas listas: ${creadas}; con error: ${fallidas}; modelos omitidos: ${omitidos}`);

  const Roles = require(path.join(DIST, 'models', 'role')).default;
  const RolUsers = require(path.join(DIST, 'models', 'role_users')).default;
  const User = require(path.join(DIST, 'models', 'user')).default;

  const [rol] = await Roles.findOrCreate({
    where: { name: 'Administrador' },
    defaults: { name: 'Administrador', desc: 'Administrador local' },
  });
  const [usuario, nuevo] = await User.findOrCreate({
    where: { name: 'admin.local' },
    defaults: {
      name: 'admin.local',
      email: 'admin@local.test',
      password: await bcrypt.hash('local123', 10),
    },
  });
  if (nuevo) await RolUsers.create({ role_id: rol.id, user_id: usuario.id });
  console.log(`[preparar-bd] Usuario admin.local ${nuevo ? 'creado' : 'ya existía'}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[preparar-bd] Error:', err.message);
  process.exit(1);
});
