"use strict";
// Script de un solo uso para crear la cuenta del área de Comunicación Social,
// que solo debe poder ver /transmision (ver auth.guard.ts y menu.ts en el
// frontend, que restringen todo lo demás para el rol 'comunicacion').
//
// Uso (desde backend/, en el servidor):
//   npx ts-node src/scripts/crear-usuario-comunicacion.ts <usuario> <password>
// o compilado:
//   node dist/scripts/crear-usuario-comunicacion.js <usuario> <password>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const role_1 = __importDefault(require("../models/role"));
const role_users_1 = __importDefault(require("../models/role_users"));
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const [username, password] = process.argv.slice(2);
        if (!username || !password) {
            console.error('Uso: ts-node src/scripts/crear-usuario-comunicacion.ts <usuario> <password>');
            process.exit(1);
        }
        yield registrocomisiones_1.default.authenticate();
        const existente = yield user_1.default.findOne({ where: { name: username } });
        if (existente) {
            console.error(`Ya existe un usuario con name = "${username}"`);
            process.exit(1);
        }
        const [rol] = yield role_1.default.findOrCreate({
            where: { name: 'comunicacion' },
            defaults: { name: 'comunicacion', desc: 'Comunicación Social — solo ve /transmision' }
        });
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const nuevoUser = yield user_1.default.create({
            name: username,
            email: null,
            password: passwordHash,
            integrante_legislatura_id: null,
        });
        yield role_users_1.default.create({
            role_id: rol.id,
            user_id: nuevoUser.id,
        });
        console.log(`Usuario creado: ${username} / ${password} (rol: comunicacion)`);
        process.exit(0);
    });
}
main().catch((err) => {
    console.error('Error al crear el usuario:', err);
    process.exit(1);
});
