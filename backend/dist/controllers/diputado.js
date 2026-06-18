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
exports.getMisComisiones = exports.getSesionesComisionesActivas = exports.getComisionInfo = exports.getMisVotos = exports.getOrdenDelDia = exports.getMiAsistencia = exports.getMiPerfil = exports.getSesionActiva = exports.getEstadoPanel = exports.registrarVoto = exports.registrarAsistencia = exports.crearCuentasDiputados = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const role_users_1 = __importDefault(require("../models/role_users"));
const role_1 = __importDefault(require("../models/role"));
const diputado_1 = __importDefault(require("../models/diputado"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const integrante_comisions_1 = __importDefault(require("../models/integrante_comisions"));
const comisions_1 = __importDefault(require("../models/comisions"));
const tipo_cargo_comisions_1 = __importDefault(require("../models/tipo_cargo_comisions"));
const puntos_ordens_1 = __importDefault(require("../models/puntos_ordens"));
const anfitrion_agendas_1 = __importDefault(require("../models/anfitrion_agendas"));
const agendas_1 = __importDefault(require("../models/agendas"));
const sedes_1 = __importDefault(require("../models/sedes"));
// Helper: obtiene el diputado_id real desde el integrante_legislatura_id del token.
// AsistenciaVoto y VotosPunto almacenan diputado.id, no integrante_legislatura.id.
function getDiputadoId(integranteLegislaturaId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const integrante = yield integrante_legislaturas_1.default.findByPk(integranteLegislaturaId);
        return (_a = integrante === null || integrante === void 0 ? void 0 : integrante.diputado_id) !== null && _a !== void 0 ? _a : null;
    });
}
// Helper: obtiene descripcion y fecha del evento desde la BD SAF.
function getInfoEvento(idAgenda) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [rows] = yield registrocomisiones_1.default.query('SELECT id, descripcion, fecha FROM agendas WHERE id = :id LIMIT 1', { replacements: { id: idAgenda } });
            if (!rows.length)
                return null;
            return { descripcion: rows[0].descripcion, fecha: rows[0].fecha };
        }
        catch (_a) {
            return null;
        }
    });
}
// Crea cuentas de usuario para todos los diputados activos que aún no tienen cuenta
const crearCuentasDiputados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let [rolDiputado] = yield role_1.default.findOrCreate({
            where: { name: 'diputado' },
            defaults: { name: 'diputado', desc: 'Rol para diputados activos' }
        });
        const integrantes = yield integrante_legislaturas_1.default.findAll({ where: { fecha_fin: null } });
        if (!integrantes.length) {
            return res.status(404).json({ msg: 'No se encontraron integrantes en integrante_legislaturas' });
        }
        const diputadoIds = integrantes.map((i) => i.diputado_id);
        const diputadosList = yield diputado_1.default.findAll({ where: { id: diputadoIds } });
        const diputadoMap = Object.fromEntries(diputadosList.map((d) => [d.id, d]));
        const creados = [];
        const existentes = [];
        const errores = [];
        for (const integrante of integrantes) {
            const dip = diputadoMap[integrante.diputado_id];
            if (!dip)
                continue;
            const nombreCompleto = `${dip.apaterno} ${dip.amaterno} ${dip.nombres}`.trim();
            const username = `DIP-${dip.nombres.substring(0, 8).toUpperCase()}`;
            const existeUser = yield user_1.default.findOne({
                where: { integrante_legislatura_id: integrante.id }
            });
            if (existeUser) {
                existentes.push(nombreCompleto);
                continue;
            }
            try {
                const passwordPlain = `DIP-${integrante.id.substring(0, 8)}`;
                const passwordHash = yield bcrypt_1.default.hash(passwordPlain, 10);
                const nuevoUser = yield user_1.default.create({
                    name: username,
                    email: dip.email || null,
                    password: passwordHash,
                    integrante_legislatura_id: integrante.id,
                });
                yield role_users_1.default.create({
                    role_id: rolDiputado.id,
                    user_id: nuevoUser.id,
                });
                creados.push(`${nombreCompleto} → usuario: ${username} / pass: ${passwordPlain}`);
            }
            catch (err) {
                errores.push(`${nombreCompleto}: ${err.message}`);
            }
        }
        return res.json({
            msg: 'Proceso completado',
            creados: creados.length,
            existentes: existentes.length,
            errores: errores.length,
            detalle_creados: creados,
            detalle_errores: errores,
        });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al crear cuentas', error: error.message });
    }
});
exports.crearCuentasDiputados = crearCuentasDiputados;
// Registrar asistencia del diputado: busca el registro PENDIENTE y lo actualiza.
// El frontend pasa id_comision para que el backend emita el socket al room correcto.
const registrarAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const { id_agenda, id_comision, partido_dip, id_cargo_dip, orden } = req.body;
        if (!id_agenda) {
            return res.status(400).json({ msg: 'id_agenda es requerido' });
        }
        const diputadoId = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoId) {
            return res.status(404).json({ msg: 'No se encontró el perfil de diputado vinculado a tu cuenta.' });
        }
        // Para eventos conjuntos hay un registro por comisión — filtrar por comision_dip_id cuando se provee
        const whereAsistencia = { id_diputado: diputadoId, id_agenda };
        if (id_comision)
            whereAsistencia.comision_dip_id = id_comision;
        const registro = yield asistencia_votos_1.default.findOne({ where: whereAsistencia });
        if (!registro) {
            return res.status(404).json({ msg: 'No se encontró registro de asistencia. El administrador debe iniciar la sesión.' });
        }
        if (registro.sentido_voto !== 0) {
            return res.status(409).json({ msg: 'Ya registraste tu asistencia en esta sesión' });
        }
        // sentido_voto=1 = ASISTENCIA (igual que cuando el admin marca manualmente)
        yield registro.update(Object.assign(Object.assign(Object.assign({ sentido_voto: 1, mensaje: 'ASISTENCIA' }, (partido_dip && { partido_dip })), (id_cargo_dip && { id_cargo_dip })), (orden !== undefined && { orden })));
        // El room lo provee el frontend: es idComisionRuta del admin.
        // Para comisiones coincide con comision_dip_id; para sesiones plenarias el frontend lo envía explícitamente.
        const roomId = id_comision || registro.comision_dip_id;
        const io = req.app.get('io');
        if (io && roomId) {
            io.to(`proyeccion-${roomId}`).emit('asistencia-registrada', {
                id_diputado: diputadoId,
                id_agenda,
            });
        }
        return res.status(200).json({ msg: 'Asistencia registrada correctamente', data: registro });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al registrar asistencia', error: error.message });
    }
});
exports.registrarAsistencia = registrarAsistencia;
// Registrar voto del diputado: busca el VotosPunto PENDIENTE y lo actualiza.
const registrarVoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const { sentido_voto, id_voto_punto, id_comision } = req.body;
        if (sentido_voto === undefined) {
            return res.status(400).json({ msg: 'sentido_voto es requerido' });
        }
        // 0 = Sin Registro (reset a pendiente), 1-3 = votos normales
        if (![0, 1, 2, 3].includes(Number(sentido_voto))) {
            return res.status(400).json({ msg: 'sentido_voto debe ser 0 (sin registro), 1 (a favor), 2 (abstención) o 3 (en contra)' });
        }
        const diputadoIdVoto = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoIdVoto) {
            return res.status(404).json({ msg: 'No se encontró el perfil de diputado vinculado a tu cuenta.' });
        }
        // Buscar el registro de voto correcto
        let votoRegistro = null;
        // Para eventos conjuntos: buscar por comision_dip_id usando votacionesAbiertas
        if (id_comision) {
            const votacionesAbiertas = req.app.get('votacionesAbiertas') || new Map();
            const votAbierta = votacionesAbiertas.get(id_comision);
            if (votAbierta) {
                const whereVoto = { id_diputado: diputadoIdVoto, id_comision_dip: id_comision };
                if (votAbierta.idReserva) {
                    whereVoto.id_tema_punto_voto = votAbierta.idReserva;
                }
                else if (votAbierta.idPunto && votAbierta.idIniciativa) {
                    whereVoto.id_punto = votAbierta.idPunto;
                    whereVoto.id_iniciativa = votAbierta.idIniciativa;
                }
                else if (votAbierta.idPunto) {
                    whereVoto.id_punto = votAbierta.idPunto;
                }
                votoRegistro = yield votos_punto_1.default.findOne({ where: whereVoto });
            }
        }
        // Fallback: buscar por id_voto_punto directo
        if (!votoRegistro && id_voto_punto) {
            votoRegistro = yield votos_punto_1.default.findOne({
                where: { id: id_voto_punto, id_diputado: diputadoIdVoto }
            });
        }
        if (!votoRegistro) {
            return res.status(404).json({ msg: 'No se encontró el registro de votación para este diputado.' });
        }
        const sentido = Number(sentido_voto);
        // sentido 0 = Sin Registro del diputado → mismo estado que pendiente (0 / PENDIENTE)
        const mensajeVoto = sentido === 0 ? 'PENDIENTE' : sentido === 1 ? 'A favor' : sentido === 2 ? 'Abstención' : 'En contra';
        yield votoRegistro.update({ sentido: sentido, mensaje: mensajeVoto });
        const roomIdVoto = id_comision || votoRegistro.id_comision_dip;
        const io = req.app.get('io');
        if (io && roomIdVoto) {
            io.to(`proyeccion-${roomIdVoto}`).emit('voto-registrado', {
                id_diputado: diputadoIdVoto,
                sentido_voto: sentido,
                id: votoRegistro.id,
            });
        }
        return res.status(200).json({ msg: 'Voto registrado correctamente', data: votoRegistro });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al registrar voto', error: error.message });
    }
});
exports.registrarVoto = registrarVoto;
// Retorna el estado actual del panel para el diputado (persiste al recargar).
// Incluye descripcion y fecha del evento para mostrar en pantalla.
const getEstadoPanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const diputadoIdPanel = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoIdPanel) {
            return res.json({ asistencia: null, votacion: null });
        }
        const asistenciasAbiertas = req.app.get('asistenciasAbiertas') || new Map();
        const votacionesAbiertas = req.app.get('votacionesAbiertas') || new Map();
        const filtroAgenda = req.query.idAgenda;
        let asistenciaPanel = null;
        let votacionPanel = null;
        for (const [idComision, estado] of asistenciasAbiertas.entries()) {
            if (filtroAgenda && estado.idAgenda !== filtroAgenda)
                continue;
            const registro = yield asistencia_votos_1.default.findOne({
                where: { id_diputado: diputadoIdPanel, id_agenda: estado.idAgenda }
            });
            if (registro) {
                const eventoInfo = yield getInfoEvento(estado.idAgenda);
                asistenciaPanel = {
                    idComision,
                    idComisiones: (_a = estado.idComisiones) !== null && _a !== void 0 ? _a : [idComision],
                    idAgenda: estado.idAgenda,
                    yaRegistro: registro.sentido_voto !== 0,
                    descripcion: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.descripcion) || '',
                    fecha: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.fecha) || '',
                };
                break;
            }
        }
        for (const [idComision, estado] of votacionesAbiertas.entries()) {
            if (filtroAgenda && estado.idAgenda !== filtroAgenda)
                continue;
            const { idPunto, idReserva, idIniciativa } = estado;
            let whereVoto = { id_diputado: diputadoIdPanel };
            if (idReserva) {
                whereVoto.id_tema_punto_voto = idReserva;
            }
            else if (idPunto && idIniciativa) {
                whereVoto.id_punto = idPunto;
                whereVoto.id_iniciativa = idIniciativa;
            }
            else if (idPunto) {
                whereVoto.id_punto = idPunto;
                whereVoto.id_iniciativa = null;
            }
            else {
                whereVoto.id_comision_dip = idComision;
                whereVoto.sentido = 0;
            }
            const votoRegistro = yield votos_punto_1.default.findOne({ where: whereVoto });
            if (votoRegistro) {
                const eventoInfo = yield getInfoEvento(estado.idAgenda);
                votacionPanel = {
                    idComision,
                    idComisiones: (_b = estado.idComisiones) !== null && _b !== void 0 ? _b : [idComision],
                    idAgenda: estado.idAgenda,
                    punto: estado.punto,
                    id_voto_punto: votoRegistro.id,
                    yaVoto: ((_c = votoRegistro.sentido) !== null && _c !== void 0 ? _c : 0) !== 0,
                    sentidoActual: votoRegistro.sentido,
                    descripcion: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.descripcion) || '',
                    fecha: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.fecha) || '',
                    idPunto: (_d = estado.idPunto) !== null && _d !== void 0 ? _d : null,
                    idReserva: (_e = estado.idReserva) !== null && _e !== void 0 ? _e : null,
                    idIniciativa: (_f = estado.idIniciativa) !== null && _f !== void 0 ? _f : null,
                };
                break;
            }
        }
        return res.json({ asistencia: asistenciaPanel, votacion: votacionPanel });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener estado del panel', error: error.message });
    }
});
exports.getEstadoPanel = getEstadoPanel;
// Obtener el estado actual de la sesión activa para el panel del diputado
const getSesionActiva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idComision } = req.params;
        const [agendaRows] = yield registrocomisiones_1.default.query(`
            SELECT a.id, a.descripcion, a.fecha, a.hora, a.status
            FROM agendas a
            INNER JOIN anfitrion_agendas aa ON aa.agenda_id = a.id
            WHERE aa.comision_id = :idComision
              AND a.status = 1
            ORDER BY a.fecha DESC, a.hora DESC
            LIMIT 1
        `, { replacements: { idComision } });
        if (!agendaRows.length) {
            return res.json({ sesionActiva: false });
        }
        const agenda = agendaRows[0];
        const [puntos] = yield registrocomisiones_1.default.query(`
            SELECT po.id, po.punto, po.nopunto, po.observaciones
            FROM puntos_ordens po
            WHERE po.id_evento = :idAgenda
            ORDER BY po.nopunto ASC
        `, { replacements: { idAgenda: agenda.id } });
        return res.json({ sesionActiva: true, agenda, puntos });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener sesión activa', error: error.message });
    }
});
exports.getSesionActiva = getSesionActiva;
// Obtener el perfil del diputado logueado
const getMiPerfil = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const integrante = yield integrante_legislaturas_1.default.findByPk(integranteLegislaturaId);
        if (!integrante) {
            return res.status(404).json({ msg: 'Perfil de diputado no encontrado' });
        }
        const diputado = yield diputado_1.default.findByPk(integrante.diputado_id);
        return res.json({ integrante: Object.assign(Object.assign({}, integrante.toJSON()), { diputado }) });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener perfil', error: error.message });
    }
});
exports.getMiPerfil = getMiPerfil;
/** Verifica si el diputado ya registró asistencia en una sesión específica */
const getMiAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const integranteLegislaturaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.integrante_legislatura_id;
        if (!integranteLegislaturaId)
            return res.status(403).json({ msg: 'Sin perfil de diputado' });
        const { idAgenda } = req.params;
        // AsistenciaVoto almacena diputado.id (no integrante_legislatura.id)
        const diputadoId = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoId)
            return res.json({ yaRegistro: false, sentido: 0, mensaje: '' });
        const registro = yield asistencia_votos_1.default.findOne({
            where: { id_diputado: diputadoId, id_agenda: idAgenda }
        });
        return res.json({
            yaRegistro: registro ? registro.sentido_voto !== 0 : false,
            sentido: (_b = registro === null || registro === void 0 ? void 0 : registro.sentido_voto) !== null && _b !== void 0 ? _b : 0,
            mensaje: (_c = registro === null || registro === void 0 ? void 0 : registro.mensaje) !== null && _c !== void 0 ? _c : '',
        });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener asistencia', error: error.message });
    }
});
exports.getMiAsistencia = getMiAsistencia;
/** Devuelve los puntos del orden del día de una sesión */
const getOrdenDelDia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idAgenda } = req.params;
        const puntos = yield puntos_ordens_1.default.findAll({
            where: {
                id_evento: idAgenda
            },
            attributes: [
                'id',
                'punto',
                'nopunto',
                'observaciones'
            ],
            order: [['nopunto', 'ASC']]
        });
        return res.json({ puntos });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Error al obtener orden del día',
            error: error.message
        });
    }
});
exports.getOrdenDelDia = getOrdenDelDia;
/** Devuelve los votos del diputado para los puntos de una sesión */
const getMisVotos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const integranteLegislaturaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Sin perfil de diputado' });
        }
        const { idAgenda } = req.params;
        const diputadoId = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoId) {
            return res.json({ votos: [] });
        }
        const puntos = yield puntos_ordens_1.default.findAll({
            where: {
                id_evento: idAgenda
            },
            attributes: [
                'id',
                'punto',
                'nopunto'
            ],
            order: [['nopunto', 'ASC']]
        });
        if (!puntos.length) {
            return res.json({ votos: [] });
        }
        const puntoIds = puntos.map(p => p.id);
        const registros = yield votos_punto_1.default.findAll({
            where: {
                id_diputado: diputadoId,
                id_punto: puntoIds
            }
        });
        const votoMap = {};
        registros.forEach((v) => {
            if (v.id_punto != null) {
                votoMap[Number(v.id_punto)] = v;
            }
        });
        const votos = puntos
            .map((p) => {
            var _a;
            const voto = votoMap[p.id];
            if (!voto || voto.sentido === 0) {
                return null;
            }
            return {
                nopunto: p.nopunto,
                punto: p.punto,
                sentido: voto.sentido,
                mensaje: (_a = voto.mensaje) !== null && _a !== void 0 ? _a : '',
            };
        })
            .filter(Boolean);
        return res.json({ votos });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Error al obtener votos',
            error: error.message
        });
    }
});
exports.getMisVotos = getMisVotos;
/** Devuelve próximos eventos, eventos pasados e integrantes de una comisión */
const getComisionInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idComision } = req.params;
        const now = new Date();
        const fechaHoy = now.toISOString().slice(0, 10);
        // Próximos eventos (agendas futuras donde esta comisión es anfitrión)
        const [proximos] = yield registrocomisiones_1.default.query(`
            SELECT a.id, a.descripcion, a.fecha, a.hora, a.fecha_hora
            FROM agendas a
            INNER JOIN anfitrion_agendas aa ON aa.agenda_id = a.id AND aa.deleted_at IS NULL
            WHERE aa.autor_id = :idComision
              AND a.deleted_at IS NULL
              AND DATE(COALESCE(a.fecha_hora, a.fecha)) >= :fechaHoy
            ORDER BY COALESCE(a.fecha_hora, a.fecha) ASC
            LIMIT 5
        `, { replacements: { idComision, fechaHoy } });
        // Eventos pasados (últimas 5 sesiones)
        const [pasados] = yield registrocomisiones_1.default.query(`
            SELECT a.id, a.descripcion, a.fecha, a.hora, a.fecha_hora
            FROM agendas a
            INNER JOIN anfitrion_agendas aa ON aa.agenda_id = a.id AND aa.deleted_at IS NULL
            WHERE aa.autor_id = :idComision
              AND a.deleted_at IS NULL
              AND DATE(COALESCE(a.fecha_hora, a.fecha)) < :fechaHoy
            ORDER BY COALESCE(a.fecha_hora, a.fecha) DESC
            LIMIT 5
        `, { replacements: { idComision, fechaHoy } });
        // Integrantes con nombre y cargo
        const integrantesRaw = yield integrante_comisions_1.default.findAll({
            where: { comision_id: idComision, fecha_fin: null },
            include: [{ model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['valor'] }],
            order: [['orden', 'ASC']],
        });
        const integrantes = yield Promise.all(integrantesRaw.map((ic) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const il = yield integrante_legislaturas_1.default.findByPk(ic.integrante_legislatura_id, { raw: true });
            let nombre = 'Diputado/a';
            if (il === null || il === void 0 ? void 0 : il.diputado_id) {
                const dip = yield diputado_1.default.findByPk(il.diputado_id, { raw: true });
                if (dip)
                    nombre = (_a = dip.alias) !== null && _a !== void 0 ? _a : `${(_b = dip.nombres) !== null && _b !== void 0 ? _b : ''} ${(_c = dip.apaterno) !== null && _c !== void 0 ? _c : ''} ${(_d = dip.amaterno) !== null && _d !== void 0 ? _d : ''}`.trim();
            }
            return { id: ic.id, nombre, cargo: (_f = (_e = ic.tipo_cargo) === null || _e === void 0 ? void 0 : _e.valor) !== null && _f !== void 0 ? _f : '', orden: ic.orden };
        })));
        return res.json({ proximos, pasados, integrantes });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener info de comisión', error: error.message });
    }
});
exports.getComisionInfo = getComisionInfo;
// Retorna sesiones de comisión activas con su idComision.
// Para sesiones antiguas (sin idComision guardado) lo resuelve via AnfitrionAgenda.
const getSesionesComisionesActivas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sesionesActivas = req.app.get('sesionesActivas') || new Map();
        const comisionSessions = Array.from(sesionesActivas.entries())
            .filter(([, s]) => s.esComision)
            .map(([clave, s]) => (Object.assign({ clave }, s)));
        const resultado = yield Promise.all(comisionSessions.map((s) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let idComision = (_a = s.idComision) !== null && _a !== void 0 ? _a : null;
            let idComisiones = ((_b = s.idComisiones) === null || _b === void 0 ? void 0 : _b.length) ? [...s.idComisiones] : [];
            // Si idComision no es UUID, intentar resolver por nombre
            const esUUID = (id) => !!id && id.length === 36 && id.includes('-');
            if (!esUUID(idComision) && s.titulo) {
                const com = yield comisions_1.default.findOne({ where: { nombre: s.titulo } });
                if (com === null || com === void 0 ? void 0 : com.id)
                    idComision = com.id;
            }
            // Si todavía no tenemos UUIDs (sesión iniciada con código viejo), consultar AnfitrionAgenda
            if (idComisiones.length === 0 && s.idAgenda) {
                try {
                    const anfitriones = yield anfitrion_agendas_1.default.findAll({
                        where: { agenda_id: s.idAgenda },
                        attributes: ['autor_id'],
                        raw: true,
                    });
                    idComisiones = anfitriones.map((a) => a.autor_id).filter(Boolean);
                    if (!esUUID(idComision) && idComisiones.length > 0)
                        idComision = idComisiones[0];
                }
                catch (_e) { }
            }
            if (idComisiones.length === 0 && idComision)
                idComisiones = [idComision];
            // Obtener sede desde la tabla agendas → sedes
            let sede = null;
            if (s.idAgenda) {
                try {
                    const agenda = yield agendas_1.default.findByPk(s.idAgenda, {
                        include: [{ model: sedes_1.default, as: 'sede', attributes: ['sede'] }],
                        attributes: ['id'],
                    });
                    sede = (_d = (_c = agenda === null || agenda === void 0 ? void 0 : agenda.sede) === null || _c === void 0 ? void 0 : _c.sede) !== null && _d !== void 0 ? _d : null;
                }
                catch (_f) { }
            }
            return { idAgenda: s.idAgenda, titulo: s.titulo, fecha: s.fecha, idComision, idComisiones, sede };
        })));
        return res.json({ sesiones: resultado.filter(s => { var _a; return s.idComision || ((_a = s.idComisiones) === null || _a === void 0 ? void 0 : _a.length); }) });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener sesiones activas', error: error.message });
    }
});
exports.getSesionesComisionesActivas = getSesionesComisionesActivas;
const getMisComisiones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const integranteLegislaturaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Cuenta no vinculada a perfil de diputado' });
        }
        const membresias = yield integrante_comisions_1.default.findAll({
            where: { integrante_legislatura_id: integranteLegislaturaId },
            include: [
                { model: comisions_1.default, as: 'comision', attributes: ['id', 'nombre'] },
                { model: tipo_cargo_comisions_1.default, as: 'tipo_cargo', attributes: ['id', 'valor', 'nivel'] },
            ],
        });
        const comisiones = membresias.map((m) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: (_a = m.comision) === null || _a === void 0 ? void 0 : _a.id,
                nombre: (_b = m.comision) === null || _b === void 0 ? void 0 : _b.nombre,
                cargo: (_d = (_c = m.tipo_cargo) === null || _c === void 0 ? void 0 : _c.valor) !== null && _d !== void 0 ? _d : 'Vocal',
                nivel: (_f = (_e = m.tipo_cargo) === null || _e === void 0 ? void 0 : _e.nivel) !== null && _f !== void 0 ? _f : 99,
            });
        }).filter((c) => c.id);
        return res.json({ comisiones });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al obtener comisiones', error: error.message });
    }
});
exports.getMisComisiones = getMisComisiones;
