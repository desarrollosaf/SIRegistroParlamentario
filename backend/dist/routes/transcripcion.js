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
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const agendas_1 = __importDefault(require("../models/agendas"));
const transcripcion_sesiones_1 = __importDefault(require("../models/transcripcion_sesiones"));
const transcripcion_participaciones_1 = __importDefault(require("../models/transcripcion_participaciones"));
const transcripcion_resumenes_1 = __importDefault(require("../models/transcripcion_resumenes"));
const router = (0, express_1.Router)();
// URL del servicio de transcripción (FastAPI). Configurable por entorno.
const TRANSCRIPTOR_URL = (process.env.TRANSCRIPTOR_URL || 'http://localhost:8000').replace(/\/$/, '');
// URL pública de ESTE backend, la que el transcriptor usará como webhook.
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || 'http://localhost:3013').replace(/\/$/, '');
// Corrida en curso por agenda: id de la sesión MySQL + último número de orden.
const corridas = new Map();
/** Devuelve (y cachea) la corrida activa de una agenda; si el backend se
 *  reinició a media transcripción, la reconstruye desde la BD. */
function corridaDe(idAgenda) {
    return __awaiter(this, void 0, void 0, function* () {
        const enMem = corridas.get(idAgenda);
        if (enMem)
            return enMem;
        const s = yield transcripcion_sesiones_1.default.findOne({
            where: { id_agenda: idAgenda }, order: [['createdAt', 'DESC']],
        });
        if (!s)
            return null;
        const max = yield transcripcion_participaciones_1.default.max('orden', { where: { id_sesion: s.id } });
        const info = { sesionId: s.id, orden: Number(max || 0) };
        corridas.set(idAgenda, info);
        return info;
    });
}
/** La sesión más reciente (para las pantallas de revisión). */
function sesionActual(idAgenda) {
    return __awaiter(this, void 0, void 0, function* () {
        return transcripcion_sesiones_1.default.findOne({
            where: { id_agenda: idAgenda }, order: [['createdAt', 'DESC']],
        });
    });
}
/** Inicia la transcripción y crea la sesión en MySQL. */
router.post('/api/transcripcion/iniciar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idAgenda, modelo, voz } = req.body || {};
        if (!idAgenda)
            return res.status(400).json({ ok: false, msg: 'Falta idAgenda.' });
        const agenda = yield agendas_1.default.findByPk(idAgenda);
        if (!agenda)
            return res.status(404).json({ ok: false, msg: 'Agenda no encontrada.' });
        const youtubeUrl = agenda.liga;
        if (!youtubeUrl) {
            return res.status(400).json({ ok: false, msg: 'La sesión no tiene liga de YouTube (campo "liga" vacío).' });
        }
        const webhook = `${BACKEND_PUBLIC_URL}/api/transcripcion/linea`;
        const { data } = yield axios_1.default.post(`${TRANSCRIPTOR_URL}/iniciar`, {
            idAgenda, youtubeUrl, webhook, modelo: modelo || 'small', voz: !!voz,
        });
        // Si no había una corrida viva, se crea una sesión nueva en MySQL.
        if (!(data === null || data === void 0 ? void 0 : data.yaEnCurso)) {
            const sesion = yield transcripcion_sesiones_1.default.create({
                id_agenda: idAgenda,
                titulo: agenda.descripcion || null,
                url: youtubeUrl,
                inicio: new Date(),
            });
            corridas.set(idAgenda, { sesionId: sesion.id, orden: 0 });
        }
        else {
            yield corridaDe(idAgenda);
        }
        const io = req.app.get('io');
        io === null || io === void 0 ? void 0 : io.to(`transcripcion-${idAgenda}`).emit('transcripcion-estado', { idAgenda, transcribiendo: true });
        return res.json(Object.assign({ ok: true }, data));
    }
    catch (err) {
        // Detalle explícito: sin esto un fallo de red se ve como un simple "Error".
        const detalle = (err === null || err === void 0 ? void 0 : err.response)
            ? { http: err.response.status, cuerpo: err.response.data }
            : { codigo: err === null || err === void 0 ? void 0 : err.code, mensaje: err === null || err === void 0 ? void 0 : err.message, url: `${TRANSCRIPTOR_URL}/iniciar` };
        console.error('[transcripcion/iniciar]', detalle);
        return res.status(500).json({
            ok: false, msg: 'No se pudo iniciar la transcripción.', detalle,
        });
    }
}));
/** Detiene la transcripción. */
router.post('/api/transcripcion/detener', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idAgenda } = req.body || {};
        if (!idAgenda)
            return res.status(400).json({ ok: false, msg: 'Falta idAgenda.' });
        const { data } = yield axios_1.default.post(`${TRANSCRIPTOR_URL}/detener`, { idAgenda });
        const info = corridas.get(idAgenda);
        if (info) {
            yield transcripcion_sesiones_1.default.update({ fin: new Date() }, { where: { id: info.sesionId } });
            corridas.delete(idAgenda);
        }
        const io = req.app.get('io');
        io === null || io === void 0 ? void 0 : io.to(`transcripcion-${idAgenda}`).emit('transcripcion-estado', { idAgenda, transcribiendo: false });
        return res.json(Object.assign({ ok: true }, data));
    }
    catch (err) {
        console.error('[transcripcion/detener]', (err === null || err === void 0 ? void 0 : err.message) || err);
        return res.status(500).json({ ok: false, msg: 'No se pudo detener la transcripción.' });
    }
}));
/** ¿La sesión está transcribiendo ahora? */
router.get('/api/transcripcion/estado/:idAgenda', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`${TRANSCRIPTOR_URL}/estado/${req.params.idAgenda}`);
        return res.json(Object.assign({ ok: true }, data));
    }
    catch (_a) {
        return res.json({ ok: true, idAgenda: req.params.idAgenda, transcribiendo: false });
    }
}));
/**
 * Webhook (público): el transcriptor manda aquí cada intervención.
 * Se GUARDA en MySQL y se reemite por socket.io a la sesión.
 */
router.post('/api/transcripcion/linea', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const linea = req.body || {};
    const idAgenda = linea.idAgenda;
    if (!idAgenda)
        return res.json({ ok: true });
    try {
        // Resolver la corrida; si el backend se reinició, crear una sesión.
        let info = yield corridaDe(idAgenda);
        if (!info) {
            const sesion = yield transcripcion_sesiones_1.default.create({
                id_agenda: idAgenda, url: linea.url || null, inicio: new Date(),
            });
            info = { sesionId: sesion.id, orden: 0 };
            corridas.set(idAgenda, info);
        }
        info.orden += 1;
        yield transcripcion_participaciones_1.default.create({
            id_sesion: info.sesionId,
            orden: info.orden,
            orador: (_a = linea.orador) !== null && _a !== void 0 ? _a : null,
            inicio_seg: (_b = linea.inicioSeg) !== null && _b !== void 0 ? _b : null,
            fin_seg: (_c = linea.finSeg) !== null && _c !== void 0 ? _c : null,
            inicio_hms: (_d = linea.inicioHms) !== null && _d !== void 0 ? _d : null,
            fin_hms: (_e = linea.finHms) !== null && _e !== void 0 ? _e : null,
            texto: (_f = linea.texto) !== null && _f !== void 0 ? _f : null,
        });
    }
    catch (err) {
        console.error('[transcripcion/linea] no se pudo guardar en MySQL:', (err === null || err === void 0 ? void 0 : err.message) || err);
        // Se sigue reemitiendo aunque falle el guardado, para no cortar el vivo.
    }
    const io = req.app.get('io');
    io === null || io === void 0 ? void 0 : io.to(`transcripcion-${idAgenda}`).emit('transcripcion-linea', linea);
    return res.json({ ok: true });
}));
// ─────────────────────────────────────────────────────────────────────────
// Revisión y resúmenes (leídos/escritos en MySQL). Autenticadas.
// ─────────────────────────────────────────────────────────────────────────
/** Intervenciones + resúmenes guardados de la sesión más reciente. */
router.get('/api/transcripcion/sesion/:idAgenda', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sesion = yield sesionActual(req.params.idAgenda);
        if (!sesion)
            return res.json({ sesionId: null, filas: [], resumenes: {} });
        const parts = yield transcripcion_participaciones_1.default.findAll({
            where: { id_sesion: sesion.id },
            order: [['orden', 'ASC'], ['createdAt', 'ASC']],
            raw: true,
        });
        const filas = parts.map((p) => ({
            id: p.id, orador: p.orador, inicio_hms: p.inicio_hms,
            inicio_seg: p.inicio_seg, texto: p.texto,
        }));
        const resArr = yield transcripcion_resumenes_1.default.findAll({
            where: { id_sesion: sesion.id }, raw: true,
        });
        const resumenes = {};
        for (const r of resArr)
            resumenes[r.ancla_id] = r.resumen;
        return res.json({ sesionId: sesion.id, filas, resumenes });
    }
    catch (err) {
        console.error('[transcripcion/sesion]', (err === null || err === void 0 ? void 0 : err.message) || err);
        return res.status(500).json({ ok: false, msg: 'Error al leer la transcripción.' });
    }
}));
/** Borra TODA la transcripción de la agenda en MySQL (para empezar de nuevo). */
router.delete('/api/transcripcion/sesion/:idAgenda', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idAgenda = req.params.idAgenda;
        const sesiones = yield transcripcion_sesiones_1.default.findAll({
            where: { id_agenda: idAgenda }, raw: true,
        });
        const ids = sesiones.map((s) => s.id);
        if (ids.length) {
            yield transcripcion_resumenes_1.default.destroy({ where: { id_sesion: ids } });
            yield transcripcion_participaciones_1.default.destroy({ where: { id_sesion: ids } });
            yield transcripcion_sesiones_1.default.destroy({ where: { id: ids } });
        }
        corridas.delete(idAgenda);
        return res.json({ ok: true, sesionesBorradas: ids.length });
    }
    catch (err) {
        console.error('[transcripcion/borrar]', (err === null || err === void 0 ? void 0 : err.message) || err);
        return res.status(500).json({ ok: false, msg: 'No se pudo borrar la transcripción.' });
    }
}));
/** Corrige el orador de un turno (una o varias intervenciones). */
router.post('/api/transcripcion/sesion/:idAgenda/actualizar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, orador } = req.body || {};
        if (!Array.isArray(ids) || !ids.length || !orador) {
            return res.status(400).json({ ok: false, msg: 'Faltan datos.' });
        }
        const [cambios] = yield transcripcion_participaciones_1.default.update({ orador }, { where: { id: ids } });
        return res.json({ ok: true, cambios });
    }
    catch (err) {
        return res.status(500).json({ ok: false, msg: 'No se pudo corregir el orador.' });
    }
}));
/** Renombra un orador en toda la sesión. */
router.post('/api/transcripcion/sesion/:idAgenda/renombrar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { de, a } = req.body || {};
        if (!de || !a)
            return res.status(400).json({ ok: false, msg: 'Faltan datos.' });
        const sesion = yield sesionActual(req.params.idAgenda);
        if (!sesion)
            return res.status(404).json({ ok: false, msg: 'Sin transcripción.' });
        const [cambios] = yield transcripcion_participaciones_1.default.update({ orador: a }, { where: { id_sesion: sesion.id, orador: de } });
        return res.json({ ok: true, cambios });
    }
    catch (err) {
        return res.status(500).json({ ok: false, msg: 'No se pudo renombrar.' });
    }
}));
/** Edita el texto de un turno (todo queda en la primera intervención). */
router.post('/api/transcripcion/sesion/:idAgenda/texto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, texto } = req.body || {};
        if (!Array.isArray(ids) || !ids.length)
            return res.status(400).json({ ok: false, msg: 'Faltan ids.' });
        yield transcripcion_participaciones_1.default.update({ texto }, { where: { id: ids[0] } });
        if (ids.length > 1) {
            yield transcripcion_participaciones_1.default.update({ texto: '' }, { where: { id: ids.slice(1) } });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        return res.status(500).json({ ok: false, msg: 'No se pudo guardar el texto.' });
    }
}));
/** Genera (con Claude, vía el transcriptor) y guarda el resumen de un turno. */
router.post('/api/transcripcion/sesion/:idAgenda/resumen', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { anclaId, orador, texto } = req.body || {};
        if (!texto)
            return res.status(400).json({ ok: false, msg: 'Sin texto.' });
        // El transcriptor genera el resumen con Claude y lo devuelve (no lo guarda).
        const { data } = yield axios_1.default.post(`${TRANSCRIPTOR_URL}/resumen-texto`, { orador: orador || '', texto }, { timeout: 120000 });
        // Se guarda en MySQL solo si Claude lo generó automáticamente.
        if ((data === null || data === void 0 ? void 0 : data.modo) === 'auto' && (data === null || data === void 0 ? void 0 : data.resumen) && anclaId) {
            const sesion = yield sesionActual(req.params.idAgenda);
            const existente = yield transcripcion_resumenes_1.default.findOne({ where: { ancla_id: anclaId } });
            if (existente) {
                yield existente.update({ resumen: data.resumen, orador: orador || null });
            }
            else {
                yield transcripcion_resumenes_1.default.create({
                    id_sesion: (sesion === null || sesion === void 0 ? void 0 : sesion.id) || null, ancla_id: anclaId,
                    orador: orador || null, resumen: data.resumen,
                });
            }
        }
        return res.json(data);
    }
    catch (err) {
        return res.status(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json(((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) || { ok: false, msg: 'No se pudo generar el resumen.' });
    }
}));
/** Borra el resumen guardado de un turno. */
router.delete('/api/transcripcion/sesion/:idAgenda/resumen/:anclaId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transcripcion_resumenes_1.default.destroy({ where: { ancla_id: req.params.anclaId } });
        return res.json({ ok: true });
    }
    catch (_a) {
        return res.status(500).json({ ok: false });
    }
}));
/** Catálogo de diputados (del transcriptor) para sugerir nombres. */
router.get('/api/transcripcion/sesion/:idAgenda/catalogo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`${TRANSCRIPTOR_URL}/sesion/${req.params.idAgenda}/catalogo`);
        return res.json(data);
    }
    catch (_a) {
        return res.json({ catalogo: [] });
    }
}));
exports.default = router;
