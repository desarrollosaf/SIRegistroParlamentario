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
exports.resetearPasswordDiputado = exports.actualizarUsuarioDiputado = exports.actualizarAliasDiputado = exports.listarDiputadosAlias = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const diputado_1 = __importDefault(require("../models/diputado"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const user_1 = __importDefault(require("../models/user"));
// Contraseña por defecto al resetear (configurable con DEFAULT_PASSWORD).
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Spid24_62';
// Lista los diputados con integrante_legislatura activo (fecha_fin = null) junto con
// los datos de su usuario (name, email) para poder editarlos.
const listarDiputadosAlias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Integrantes vigentes: sin fecha de fin (y no borrados, por el paranoid del modelo).
        const integrantes = yield integrante_legislaturas_1.default.findAll({
            where: { fecha_fin: null },
            attributes: ['id', 'diputado_id'],
            raw: true,
        });
        const diputadoIds = [...new Set(integrantes.map((i) => i.diputado_id).filter(Boolean))];
        const integranteIds = [...new Set(integrantes.map((i) => i.id).filter(Boolean))];
        if (diputadoIds.length === 0) {
            return res.json({ msg: 'Diputados obtenidos correctamente', data: [] });
        }
        // Diputados (conexión legislativo).
        const diputados = yield diputado_1.default.findAll({
            where: { id: diputadoIds },
            attributes: ['id', 'nombres', 'apaterno', 'amaterno', 'alias'],
            raw: true,
        });
        const diputadoMap = Object.fromEntries(diputados.map((d) => [d.id, d]));
        // Usuarios (conexión registrocomisiones): se enlazan por integrante_legislatura_id.
        const usuarios = yield user_1.default.findAll({
            where: { integrante_legislatura_id: integranteIds },
            attributes: ['id', 'name', 'email', 'integrante_legislatura_id'],
            raw: true,
        });
        const userMap = Object.fromEntries(usuarios.map((u) => [u.integrante_legislatura_id, u]));
        // Una fila por integrante activo, con su diputado y su usuario (si existe).
        const data = integrantes
            .filter((i) => diputadoMap[i.diputado_id])
            .map((i) => {
            var _a, _b, _c, _d;
            const dip = diputadoMap[i.diputado_id];
            const user = (_a = userMap[i.id]) !== null && _a !== void 0 ? _a : null;
            return {
                integrante_legislatura_id: i.id,
                diputado_id: dip.id,
                nombres: dip.nombres,
                apaterno: dip.apaterno,
                amaterno: dip.amaterno,
                alias: dip.alias,
                user_id: (_b = user === null || user === void 0 ? void 0 : user.id) !== null && _b !== void 0 ? _b : null,
                name: (_c = user === null || user === void 0 ? void 0 : user.name) !== null && _c !== void 0 ? _c : null,
                email: (_d = user === null || user === void 0 ? void 0 : user.email) !== null && _d !== void 0 ? _d : null,
                tiene_usuario: !!user,
            };
        })
            .sort((a, b) => `${a.apaterno} ${a.amaterno} ${a.nombres}`.localeCompare(`${b.apaterno} ${b.amaterno} ${b.nombres}`));
        return res.json({ msg: 'Diputados obtenidos correctamente', data });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener diputados', error: error.message });
    }
});
exports.listarDiputadosAlias = listarDiputadosAlias;
// Actualiza únicamente el alias de un diputado por su id.
const actualizarAliasDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const aliasRaw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.alias;
        // Normaliza: cadena vacía → null (para limpiar el alias).
        const alias = typeof aliasRaw === 'string' && aliasRaw.trim() !== '' ? aliasRaw.trim() : null;
        const diputado = yield diputado_1.default.findByPk(id);
        if (!diputado) {
            return res.status(404).json({ msg: `No se encontró el diputado con id ${id}` });
        }
        yield diputado.update({ alias });
        return res.json({ msg: 'Alias actualizado correctamente', data: { id: diputado.id, alias: diputado.alias } });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar el alias', error: error.message });
    }
});
exports.actualizarAliasDiputado = actualizarAliasDiputado;
// Actualiza el usuario (name) y el correo del usuario ligado a un integrante_legislatura.
const actualizarUsuarioDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { integranteLegislaturaId } = req.params;
        const nameRaw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.name;
        const emailRaw = (_b = req.body) === null || _b === void 0 ? void 0 : _b.email;
        const user = yield user_1.default.findOne({
            where: { integrante_legislatura_id: integranteLegislaturaId }
        });
        if (!user) {
            return res.status(404).json({ msg: 'Este diputado no tiene un usuario asignado' });
        }
        const cambios = {};
        if (typeof nameRaw === 'string') {
            const name = nameRaw.trim();
            if (name === '') {
                return res.status(400).json({ msg: 'El usuario (name) no puede quedar vacío' });
            }
            cambios.name = name;
        }
        if (typeof emailRaw === 'string') {
            const email = emailRaw.trim();
            cambios.email = email === '' ? null : email;
        }
        if (Object.keys(cambios).length === 0) {
            return res.status(400).json({ msg: 'No se enviaron cambios (name o email)' });
        }
        yield user.update(cambios);
        return res.json({
            msg: 'Usuario actualizado correctamente',
            data: {
                user_id: user.id,
                integrante_legislatura_id: user.integrante_legislatura_id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar el usuario', error: error.message });
    }
});
exports.actualizarUsuarioDiputado = actualizarUsuarioDiputado;
// Resetea la contraseña del usuario ligado a un integrante_legislatura a la contraseña por defecto.
const resetearPasswordDiputado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { integranteLegislaturaId } = req.params;
        const user = yield user_1.default.findOne({
            where: { integrante_legislatura_id: integranteLegislaturaId }
        });
        if (!user) {
            return res.status(404).json({ msg: 'Este diputado no tiene un usuario asignado' });
        }
        const passwordHash = yield bcrypt_1.default.hash(DEFAULT_PASSWORD, 10);
        yield user.update({ password: passwordHash });
        return res.json({
            msg: 'Contraseña restablecida correctamente',
            data: { user_id: user.id, password_default: DEFAULT_PASSWORD },
        });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al restablecer la contraseña', error: error.message });
    }
});
exports.resetearPasswordDiputado = resetearPasswordDiputado;
