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
exports.getMiPerfil = exports.getSesionActiva = exports.getEstadoPanel = exports.registrarVoto = exports.registrarAsistencia = exports.crearCuentasDiputados = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const role_users_1 = __importDefault(require("../models/role_users"));
const role_1 = __importDefault(require("../models/role"));
const diputado_1 = __importDefault(require("../models/diputado"));
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const votos_punto_1 = __importDefault(require("../models/votos_punto"));
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
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
        const registro = yield asistencia_votos_1.default.findOne({
            where: { id_diputado: diputadoId, id_agenda }
        });
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
        if (![1, 2, 3].includes(Number(sentido_voto))) {
            return res.status(400).json({ msg: 'sentido_voto debe ser 1 (a favor), 2 (abstención) o 3 (en contra)' });
        }
        const diputadoIdVoto = yield getDiputadoId(integranteLegislaturaId);
        if (!diputadoIdVoto) {
            return res.status(404).json({ msg: 'No se encontró el perfil de diputado vinculado a tu cuenta.' });
        }
        if (!id_voto_punto) {
            return res.status(400).json({ msg: 'id_voto_punto es requerido' });
        }
        const votoRegistro = yield votos_punto_1.default.findOne({
            where: { id: id_voto_punto, id_diputado: diputadoIdVoto }
        });
        if (!votoRegistro) {
            return res.status(404).json({ msg: 'No se encontró el registro de votación para este diputado.' });
        }
        const sentido = Number(sentido_voto);
        const mensajeVoto = sentido === 1 ? 'A favor' : sentido === 2 ? 'Abstención' : 'En contra';
        yield votoRegistro.update({ sentido, mensaje: mensajeVoto });
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
    var _a;
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
        let asistenciaPanel = null;
        let votacionPanel = null;
        for (const [idComision, estado] of asistenciasAbiertas.entries()) {
            const registro = yield asistencia_votos_1.default.findOne({
                where: { id_diputado: diputadoIdPanel, id_agenda: estado.idAgenda }
            });
            if (registro) {
                const eventoInfo = yield getInfoEvento(estado.idAgenda);
                asistenciaPanel = {
                    idComision,
                    idAgenda: estado.idAgenda,
                    yaRegistro: registro.sentido_voto !== 0,
                    descripcion: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.descripcion) || '',
                    fecha: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.fecha) || '',
                };
                break;
            }
        }
        for (const [idComision, estado] of votacionesAbiertas.entries()) {
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
                    idAgenda: estado.idAgenda,
                    punto: estado.punto,
                    id_voto_punto: votoRegistro.id,
                    yaVoto: ((_a = votoRegistro.sentido) !== null && _a !== void 0 ? _a : 0) !== 0,
                    sentidoActual: votoRegistro.sentido,
                    descripcion: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.descripcion) || '',
                    fecha: (eventoInfo === null || eventoInfo === void 0 ? void 0 : eventoInfo.fecha) || '',
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
