// Script de un solo uso para crear la cuenta del área de Comunicación Social,
// que solo debe poder ver /transmision (ver auth.guard.ts y menu.ts en el
// frontend, que restringen todo lo demás para el rol 'comunicacion').
//
// Uso (desde backend/, en el servidor):
//   npx ts-node src/scripts/crear-usuario-comunicacion.ts <usuario> <password>
// o compilado:
//   node dist/scripts/crear-usuario-comunicacion.js <usuario> <password>

import 'dotenv/config';
import bcrypt from 'bcrypt';
import User from '../models/user';
import Roles from '../models/role';
import RolUsers from '../models/role_users';
import sequelize from '../database/registrocomisiones';

async function main() {
    const [username, password] = process.argv.slice(2);
    if (!username || !password) {
        console.error('Uso: ts-node src/scripts/crear-usuario-comunicacion.ts <usuario> <password>');
        process.exit(1);
    }

    await sequelize.authenticate();

    const existente = await User.findOne({ where: { name: username } });
    if (existente) {
        console.error(`Ya existe un usuario con name = "${username}"`);
        process.exit(1);
    }

    const [rol] = await Roles.findOrCreate({
        where: { name: 'comunicacion' },
        defaults: { name: 'comunicacion', desc: 'Comunicación Social — solo ve /transmision' }
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUser = await User.create({
        name: username,
        email: null,
        password: passwordHash,
        integrante_legislatura_id: null,
    });

    await RolUsers.create({
        role_id: rol.id,
        user_id: nuevoUser.id,
    });

    console.log(`Usuario creado: ${username} / ${password} (rol: comunicacion)`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Error al crear el usuario:', err);
    process.exit(1);
});
