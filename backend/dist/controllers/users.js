"use strict";
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
exports.cerrarsesion = exports.getCurrentUser = exports.LoginUser = exports.ReadUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const role_users_1 = __importDefault(require("../models/role_users"));
const role_1 = __importDefault(require("../models/role"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ReadUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listUser = yield user_1.default.findAll();
    return res.json({
        msg: `List de categoría encontrada exitosamenteeeee`,
        data: listUser
    });
});
exports.ReadUser = ReadUser;
const LoginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, password } = req.body;
    let passwordValid = false;
    let bandera = true;
    const user = yield user_1.default.findOne({
        where: { name },
        include: [{ model: role_users_1.default, as: 'rol_users', include: [{ model: role_1.default, as: 'role' }] }]
    });
    if (!user) {
        return res.status(400).json({ msg: `Usuario no existe con el usuario ${name}` });
    }
    const hash = user.password.replace(/^\$2y\$/, '$2b$');
    passwordValid = yield bcrypt_1.default.compare(password, hash);
    if (!passwordValid) {
        return res.status(402).json({ msg: `Password Incorrecto` });
    }
    const roleName = ((_b = (_a = user.rol_users) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.name) || 'admin';
    const accessToken = jsonwebtoken_1.default.sign({ rfc: name }, process.env.SECRET_KEY || 'TSE-Poder-legislativo', { expiresIn: '2h' });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000,
        path: '/',
    });
    console.log(accessToken);
    return res.json({ user, bandera });
});
exports.LoginUser = LoginUser;
try { }
catch (error) {
    console.error('Error en LoginUser:', error);
    return res.status(500).json({
        msg: 'Error interno del servidor'
    });
}
;
const getCurrentUser = (req, res) => {
    const user = req.user;
    res.json({
        rfc: user.rfc,
        role: user.role || 'admin',
        integrante_legislatura_id: user.integrante_legislatura_id || null,
    });
};
exports.getCurrentUser = getCurrentUser;
const cerrarsesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    return res.status(200).json({ message: 'Sesión cerrada' });
});
exports.cerrarsesion = cerrarsesion;
