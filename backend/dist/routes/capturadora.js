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
exports.normalizar = normalizar;
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const diputado_1 = __importDefault(require("../models/diputado"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const agendas_1 = __importDefault(require("../models/agendas"));
const tipo_eventos_1 = __importDefault(require("../models/tipo_eventos"));
const router = (0, express_1.Router)();
function normalizar(valor) {
    return (valor || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
const SENTIDO_POR_TEXTO = {
    FAVOR: { codigo: 1, mensaje: 'A favor' },
    ABSTENCION: { codigo: 2, mensaje: 'Abstención' },
    CONTRA: { codigo: 3, mensaje: 'En contra' },
};
// La capturadora manda una petición por cada diputado detectado (~75 casi de
// golpe cuando abre una votación) — sin caché, cada una repetía un
// Diputado.findAll() completo. nombre_captura casi no cambia (se pobló una
// sola vez), así que basta refrescar cada pocos minutos en vez de por voto.
const CACHE_DIPUTADOS_TTL_MS = 5 * 60 * 1000;
let cacheDiputadosCaptura = null;
function obtenerDiputadosConNombreCaptura() {
    return __awaiter(this, void 0, void 0, function* () {
        const ahora = Date.now();
        if (cacheDiputadosCaptura && cacheDiputadosCaptura.expiraEn > ahora) {
            return cacheDiputadosCaptura.data;
        }
        const data = yield diputado_1.default.findAll({ where: { nombre_captura: { [sequelize_1.Op.ne]: null } } });
        cacheDiputadosCaptura = { data, expiraEn: ahora + CACHE_DIPUTADOS_TTL_MS };
        return data;
    });
}
/** Busca en un mapa de eventos abiertos (votacionesAbiertas/asistenciasAbiertas)
 *  cuál corresponde a una Sesión — las consultas de agenda son independientes
 *  entre sí, así que corren en paralelo en vez de una por una. */
function buscarAbiertaDeSesion(mapa) {
    return __awaiter(this, void 0, void 0, function* () {
        const entradas = Array.from(mapa.entries());
        if (entradas.length === 0)
            return null;
        const agendas = yield Promise.all(entradas.map(([, estado]) => agendas_1.default.findByPk(estado.idAgenda, {
            include: [{ model: tipo_eventos_1.default, as: 'tipoevento', attributes: ['nombre'] }],
        })));
        const idx = agendas.findIndex((agenda) => { var _a; return ((_a = agenda === null || agenda === void 0 ? void 0 : agenda.tipoevento) === null || _a === void 0 ? void 0 : _a.nombre) === 'Sesión'; });
        return idx >= 0 ? { idComision: entradas[idx][0], estado: entradas[idx][1] } : null;
    });
}
/**
 * Webhook (público, sin JWT — igual que /api/transcripcion/linea): la
 * capturadora del Pleno manda aquí cada voto detectado por color en el
 * tablero físico. Reemplaza al viejo spid.local/api/votoDipNom.
 *
 * Body: { nombre: string, sentido: "FAVOR" | "ABSTENCION" | "CONTRA" }
 *
 * El "nombre" se matchea EXACTO (normalizado) contra diputados.nombre_captura
 * — poblado una sola vez desde el nombre_db del sistema viejo (ver
 * scripts/capturadora/cruzar-nombres-spid.ts), no es fuzzy-match en vivo.
 */
router.post('/api/capturadora/voto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { nombre, sentido } = req.body || {};
        if (!nombre || !sentido) {
            return res.status(400).json({ msg: 'Faltan nombre y/o sentido' });
        }
        const sentidoInfo = SENTIDO_POR_TEXTO[String(sentido).toUpperCase()];
        if (!sentidoInfo) {
            return res.status(400).json({ msg: 'sentido inválido. Usa FAVOR, ABSTENCION o CONTRA' });
        }
        const nombreNormalizado = normalizar(nombre);
        const candidatos = yield obtenerDiputadosConNombreCaptura();
        const diputado = candidatos.find((d) => normalizar(d.nombre_captura) === nombreNormalizado) || null;
        if (!diputado) {
            return res.status(404).json({ msg: `No se encontró ningún diputado con nombre_captura = "${nombre}"` });
        }
        const votacionesAbiertas = req.app.get('votacionesAbiertas') || new Map();
        const sesionVotando = yield buscarAbiertaDeSesion(votacionesAbiertas);
        const idComisionSesion = (_a = sesionVotando === null || sesionVotando === void 0 ? void 0 : sesionVotando.idComision) !== null && _a !== void 0 ? _a : null;
        const votAbierta = (_b = sesionVotando === null || sesionVotando === void 0 ? void 0 : sesionVotando.estado) !== null && _b !== void 0 ? _b : null;
        if (!votAbierta) {
            // No hay votación abierta: puede que el tablero esté en fase de ASISTENCIA.
            // La capturadora no distingue el modo — durante asistencia manda siempre
            // sentido=ABSTENCION sin importar el color real, así que cualquier señal
            // de un diputado en esta fase significa simplemente "está presente".
            const asistenciasAbiertas = req.app.get('asistenciasAbiertas') || new Map();
            const sesionAsistiendo = yield buscarAbiertaDeSesion(asistenciasAbiertas);
            const idComisionSesionAsist = (_c = sesionAsistiendo === null || sesionAsistiendo === void 0 ? void 0 : sesionAsistiendo.idComision) !== null && _c !== void 0 ? _c : null;
            const asistAbierta = (_d = sesionAsistiendo === null || sesionAsistiendo === void 0 ? void 0 : sesionAsistiendo.estado) !== null && _d !== void 0 ? _d : null;
            if (!asistAbierta) {
                return res.status(404).json({ msg: 'No hay ninguna votación ni asistencia de Sesión abierta actualmente' });
            }
            const asistenciaRegistro = yield asistencia_votos_1.default.findOne({
                where: { id_diputado: diputado.id, id_agenda: asistAbierta.idAgenda },
            });
            if (!asistenciaRegistro) {
                return res.status(404).json({ msg: 'No se encontró el registro de asistencia para este diputado' });
            }
            if (asistenciaRegistro.sentido_voto !== 0) {
                return res.status(200).json({ msg: 'Este diputado ya tenía asistencia registrada' });
            }
            yield asistenciaRegistro.update({ sentido_voto: 1, mensaje: 'ASISTENCIA' });
            const ioAsist = req.app.get('io');
            // La sala de proyección usa el SAF id (safId), no el UUID interno que es la
            // clave del mapa — igual que hace registrarAsistencia en diputado.ts.
            const roomIdAsist = asistAbierta.safId || idComisionSesionAsist || asistenciaRegistro.comision_dip_id;
            if (ioAsist && roomIdAsist) {
                ioAsist.to(`proyeccion-${roomIdAsist}`).emit('asistencia-registrada', {
                    id_diputado: diputado.id,
                    id_agenda: asistAbierta.idAgenda,
                    sentido: 1,
                });
            }
            return res.status(200).json({ msg: 'Asistencia registrada correctamente' });
        }
        const whereVoto = { id_diputado: diputado.id };
        if (votAbierta.idReserva) {
            whereVoto.id_tema_punto_voto = votAbierta.idReserva;
        }
        else if (votAbierta.idPunto && votAbierta.idIniciativa) {
            whereVoto.id_punto = votAbierta.idPunto;
            whereVoto.id_iniciativa = votAbierta.idIniciativa;
        }
        else if (votAbierta.idPunto) {
            whereVoto.id_punto = votAbierta.idPunto;
            whereVoto.id_iniciativa = null;
        }
        const votoRegistro = yield votos_punto_1.default.findOne({ where: whereVoto });
        if (!votoRegistro) {
            return res.status(404).json({ msg: 'No se encontró el registro de votación para este diputado en el punto abierto' });
        }
        yield votoRegistro.update({ sentido: sentidoInfo.codigo, mensaje: sentidoInfo.mensaje });
        const io = req.app.get('io');
        // La sala de proyección usa el SAF id (safId), no el UUID interno que es la
        // clave del mapa — igual que hace registrarVoto en diputado.ts.
        const roomId = votAbierta.safId || idComisionSesion || votoRegistro.id_comision_dip;
        if (io && roomId) {
            io.to(`proyeccion-${roomId}`).emit('voto-registrado', {
                id_diputado: diputado.id,
                sentido_voto: sentidoInfo.codigo,
                id: votoRegistro.id,
            });
        }
        return res.status(200).json({ msg: 'Voto registrado correctamente' });
    }
    catch (error) {
        console.error('[capturadora/voto]', (error === null || error === void 0 ? void 0 : error.message) || error);
        return res.status(500).json({ msg: 'Error interno del servidor', error: error === null || error === void 0 ? void 0 : error.message });
    }
}));
exports.default = router;
