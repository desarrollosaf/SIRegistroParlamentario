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
exports.eliminarComposicion = exports.guardarComposicion = exports.listarGuardadas = exports.subirArchivoProyeccion = void 0;
const sequelize_1 = require("sequelize");
const proyeccion_guardada_1 = __importDefault(require("../models/proyeccion_guardada"));
// Crea la tabla proyeccion_guardadas la primera vez (CREATE TABLE IF NOT EXISTS), una sola vez.
let syncPromise = null;
function asegurarTabla() {
    if (!syncPromise) {
        syncPromise = proyeccion_guardada_1.default.sync().catch((e) => {
            syncPromise = null; // permite reintentar si falló
            throw e;
        });
    }
    return syncPromise;
}
// Sube una imagen o video y devuelve su ruta relativa (servida en /storage).
const subirArchivoProyeccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ msg: 'No se recibió ningún archivo' });
    }
    const path = `storage/proyeccion/${file.filename}`;
    const tipo = /^video\//.test(file.mimetype) ? 'video' : 'imagen';
    return res.json({ msg: 'Archivo subido', path, tipo });
});
exports.subirArchivoProyeccion = subirArchivoProyeccion;
// Lista las composiciones guardadas para una comisión (incluye las globales, comision_id null).
const listarGuardadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield asegurarTabla();
        const { comisionId } = req.params;
        const guardadas = yield proyeccion_guardada_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ comision_id: comisionId }, { comision_id: null }],
            },
            order: [['created_at', 'DESC']],
        });
        return res.json({ msg: 'Composiciones obtenidas', data: guardadas });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al listar composiciones', error: error.message });
    }
});
exports.listarGuardadas = listarGuardadas;
// Guarda una composición para proyectarla después.
const guardarComposicion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield asegurarTabla();
        const { comision_id, titulo, contenido } = req.body;
        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ msg: 'El título es requerido' });
        }
        if (!contenido || !contenido.tipo) {
            return res.status(400).json({ msg: 'El contenido es inválido' });
        }
        const nueva = yield proyeccion_guardada_1.default.create({
            comision_id: comision_id || null,
            titulo: String(titulo).trim(),
            tipo: contenido.tipo,
            contenido,
        });
        return res.json({ msg: 'Composición guardada', data: nueva });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al guardar la composición', error: error.message });
    }
});
exports.guardarComposicion = guardarComposicion;
// Elimina una composición guardada.
const eliminarComposicion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield asegurarTabla();
        const { id } = req.params;
        const borradas = yield proyeccion_guardada_1.default.destroy({ where: { id } });
        if (borradas === 0) {
            return res.status(404).json({ msg: 'No se encontró la composición' });
        }
        return res.json({ msg: 'Composición eliminada' });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al eliminar la composición', error: error.message });
    }
});
exports.eliminarComposicion = eliminarComposicion;
