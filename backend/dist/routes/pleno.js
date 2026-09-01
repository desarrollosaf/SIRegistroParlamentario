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
const sequelize_1 = require("sequelize");
const diputado_1 = __importDefault(require("../models/diputado"));
const agendas_1 = __importDefault(require("../models/agendas"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const capturadora_1 = require("./capturadora");
const diputado_2 = require("../controllers/diputado");
const router = (0, express_1.Router)();
/** Encuentra la entrada de tipo Sesión dentro de un mapa de asistencias/votaciones abiertas. */
function buscarSesionAbierta(mapa) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        for (const [idComision, estado] of mapa.entries()) {
            const agenda = yield agendas_1.default.findByPk(estado.idAgenda, {
                include: [{ model: tipo_eventos_1.default, as: 'tipoevento', attributes: ['nombre'] }],
            });
            if (((_a = agenda === null || agenda === void 0 ? void 0 : agenda.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === 'Sesión') {
                return { idComision, estado };
            }
        }
        return null;
    });
}
/**
 * Webhook (público, solo red local — igual que /api/capturadora/voto) del
 * programa de reconocimiento facial: avisa qué diputado está sentado frente
 * a una pantalla del Pleno. Le notifica a esa pantalla por socket quién es,
 * y si hay asistencia de Sesión abierta y el diputado no la había
 * registrado, la marca automáticamente (sin que nadie presione nada).
 *
 * Body: { idPantalla: string, nombre: string }
 * El "nombre" se matchea igual que en la capturadora: contra
 * diputados.nombre_captura, exacto y normalizado.
 */
router.post('/api/pleno/identidad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { idPantalla, nombre } = req.body || {};
        if (!idPantalla || !nombre) {
            return res.status(400).json({ msg: 'Faltan idPantalla y/o nombre' });
        }
        const nombreNormalizado = (0, capturadora_1.normalizar)(nombre);
        const candidatos = yield diputado_1.default.findAll({ where: { nombre_captura: { [sequelize_1.Op.ne]: null } } });
        const diputado = candidatos.find((d) => (0, capturadora_1.normalizar)(d.nombre_captura) === nombreNormalizado) || null;
        if (!diputado) {
            return res.status(404).json({ msg: `No se encontró ningún diputado con nombre_captura = "${nombre}"` });
        }
        const diputadoId = diputado.id;
        const nombreCompleto = `${(_a = diputado.apaterno) !== null && _a !== void 0 ? _a : ''} ${(_b = diputado.amaterno) !== null && _b !== void 0 ? _b : ''} ${(_c = diputado.nombres) !== null && _c !== void 0 ? _c : ''}`.trim();
        // Asistencia automática: si hay una Sesión con asistencia abierta y este
        // diputado todavía no la registraba, se marca presente sin intervención.
        const asistenciasAbiertas = req.app.get('asistenciasAbiertas') || new Map();
        const sesionAsist = yield buscarSesionAbierta(asistenciasAbiertas);
        if (sesionAsist) {
            // Se ignora el resultado a propósito: si ya estaba registrada o no
            // aplica, no es un error para este flujo — solo importa intentarlo.
            yield (0, diputado_2.registrarAsistenciaCore)(diputadoId, { id_agenda: sesionAsist.estado.idAgenda }, req).catch(() => null);
        }
        const io = req.app.get('io');
        io === null || io === void 0 ? void 0 : io.to(`pantalla-${idPantalla}`).emit('identidad-detectada', {
            diputado_id: diputadoId,
            nombre: nombreCompleto,
            alias: diputado.alias || null,
        });
        return res.status(200).json({ msg: 'Identidad procesada', diputado_id: diputadoId, nombre: nombreCompleto });
    }
    catch (error) {
        console.error('[pleno/identidad]', (error === null || error === void 0 ? void 0 : error.message) || error);
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
/**
 * Cuando el reconocimiento facial deja de detectar a alguien frente a una
 * pantalla (se levantó / cambió de lugar), regresa esa pantalla a espera.
 * Body: { idPantalla: string }
 */
router.post('/api/pleno/sin-identidad', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idPantalla } = req.body || {};
        if (!idPantalla)
            return res.status(400).json({ msg: 'Falta idPantalla' });
        const io = req.app.get('io');
        io === null || io === void 0 ? void 0 : io.to(`pantalla-${idPantalla}`).emit('identidad-perdida');
        return res.status(200).json({ msg: 'ok' });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
/**
 * La pantalla de pleno registra el voto del diputado que tiene enfrente.
 * Sin JWT: el diputado_id ya lo resolvió esa misma pantalla vía /identidad.
 * Body: { diputado_id, sentido_voto, id_voto_punto?, id_comision? }
 */
router.post('/api/pleno/voto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.body || {};
        if (!diputado_id)
            return res.status(400).json({ msg: 'diputado_id es requerido' });
        const { status, body } = yield (0, diputado_2.registrarVotoCore)(diputado_id, req.body, req);
        return res.status(status).json(body);
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
/**
 * Confirmación manual de asistencia desde la pantalla de pleno (respaldo,
 * por si la automática de /identidad no aplicó todavía).
 * Body: { diputado_id, id_agenda, id_comision? }
 */
router.post('/api/pleno/asistencia', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.body || {};
        if (!diputado_id)
            return res.status(400).json({ msg: 'diputado_id es requerido' });
        const { status, body } = yield (0, diputado_2.registrarAsistenciaCore)(diputado_id, req.body, req);
        return res.status(status).json(body);
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
/**
 * Estado actual (asistencia/votación abiertas + si ya registró) para un
 * diputado específico — la pantalla lo pide justo después de identidad-detectada.
 */
router.get('/api/pleno/estado/:diputado_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id } = req.params;
        const filtroAgenda = req.query.idAgenda;
        const estado = yield (0, diputado_2.obtenerEstadoPanel)(diputado_id, filtroAgenda, req);
        return res.json(estado);
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Orden del día de la sesión — no depende del diputado, se reutiliza tal cual.
router.get('/api/pleno/orden-del-dia/:idAgenda', diputado_2.getOrdenDelDia);
/** Votos del diputado (ya identificado) para los puntos de una sesión. */
router.get('/api/pleno/mis-votos/:diputado_id/:idAgenda', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diputado_id, idAgenda } = req.params;
        const votos = yield (0, diputado_2.obtenerMisVotos)(diputado_id, idAgenda);
        return res.json({ votos });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
exports.default = router;
