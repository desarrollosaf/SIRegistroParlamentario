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
exports.getMiPerfil = exports.getSesionActiva = exports.registrarVoto = exports.registrarAsistencia = exports.crearCuentasDiputados = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const user_1 = __importDefault(require("../models/user"));
const role_users_1 = __importDefault(require("../models/role_users"));
const role_1 = __importDefault(require("../models/role"));
const diputado_1 = __importDefault(require("../models/diputado")); // Importar primero — define la asociación belongsTo con IntegranteLegislatura
const integrante_legislaturas_1 = __importDefault(require("../models/integrante_legislaturas"));
const asistencia_votos_1 = __importDefault(require("../models/asistencia_votos"));
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
// Crea cuentas de usuario para todos los diputados activos que aún no tienen cuenta
const crearCuentasDiputados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar el rol "diputado" o crearlo si no existe
        let [rolDiputado] = yield role_1.default.findOrCreate({
            where: { name: 'diputado' },
            defaults: { name: 'diputado', desc: 'Rol para diputados activos' }
        });
        // Obtener todos los integrantes de la legislatura activa
        const integrantes = yield integrante_legislaturas_1.default.findAll();
        if (!integrantes.length) {
            return res.status(404).json({ msg: 'No se encontraron integrantes en integrante_legislaturas' });
        }
        // Traer todos los diputados relacionados en una sola consulta
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
            // Usamos el id del integrante como username (único y rastreable)
            const username = `DIP-${integrante.id.substring(0, 8).toUpperCase()}`;
            // Verificar si ya existe usuario para este integrante
            const existeUser = yield user_1.default.findOne({
                where: { integrante_legislatura_id: integrante.id }
            });
            if (existeUser) {
                existentes.push(nombreCompleto);
                continue;
            }
            try {
                // Contraseña inicial = DIP + primeras 8 chars del id (se puede cambiar después)
                const passwordPlain = `DIP-${integrante.id.substring(0, 8)}`;
                const passwordHash = yield bcrypt_1.default.hash(passwordPlain, 10);
                const nuevoUser = yield user_1.default.create({
                    id: (0, uuid_1.v4)(),
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
// Registrar asistencia del diputado en la sesión activa
const registrarAsistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const { id_agenda, partido_dip, comision_dip_id, id_cargo_dip, orden } = req.body;
        if (!id_agenda) {
            return res.status(400).json({ msg: 'id_agenda es requerido' });
        }
        // Verificar si ya registró asistencia en esta agenda
        const yaRegistro = yield asistencia_votos_1.default.findOne({
            where: {
                id_diputado: integranteLegislaturaId,
                id_agenda,
                sentido_voto: 0,
            }
        });
        if (yaRegistro) {
            return res.status(409).json({ msg: 'Ya registraste tu asistencia en esta sesión' });
        }
        const asistencia = yield asistencia_votos_1.default.create({
            sentido_voto: 0, // 0 = asistencia
            mensaje: 'Asistencia registrada por el diputado',
            id_diputado: integranteLegislaturaId,
            partido_dip: partido_dip || '',
            comision_dip_id: comision_dip_id || null,
            orden: orden || null,
            id_cargo_dip: id_cargo_dip || null,
            id_agenda,
            usuario_registra: null,
        });
        // Notificar via socket
        const io = req.app.get('io');
        if (io) {
            io.to(`proyeccion-${comision_dip_id}`).emit('asistencia-registrada', {
                id_diputado: integranteLegislaturaId,
                id_agenda,
            });
        }
        return res.status(201).json({ msg: 'Asistencia registrada correctamente', data: asistencia });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al registrar asistencia', error: error.message });
    }
});
exports.registrarAsistencia = registrarAsistencia;
// Registrar voto del diputado en un punto del orden del día
const registrarVoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenUser = req.user;
        const integranteLegislaturaId = tokenUser.integrante_legislatura_id;
        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }
        const { id_agenda, sentido_voto, partido_dip, comision_dip_id, id_cargo_dip, orden } = req.body;
        // sentido_voto: 1=a favor, 2=abstención, 3=en contra
        if (!id_agenda || sentido_voto === undefined) {
            return res.status(400).json({ msg: 'id_agenda y sentido_voto son requeridos' });
        }
        if (![1, 2, 3].includes(Number(sentido_voto))) {
            return res.status(400).json({ msg: 'sentido_voto debe ser 1 (a favor), 2 (abstención) o 3 (en contra)' });
        }
        // Verificar si ya votó en esta agenda (votos tienen sentido_voto > 0)
        const yaVoto = yield asistencia_votos_1.default.findOne({
            where: {
                id_diputado: integranteLegislaturaId,
                id_agenda,
                sentido_voto: [1, 2, 3],
            }
        });
        if (yaVoto) {
            return res.status(409).json({ msg: 'Ya registraste tu voto en este punto' });
        }
        const voto = yield asistencia_votos_1.default.create({
            sentido_voto: Number(sentido_voto),
            mensaje: sentido_voto == 1 ? 'A favor' : sentido_voto == 2 ? 'Abstención' : 'En contra',
            id_diputado: integranteLegislaturaId,
            partido_dip: partido_dip || '',
            comision_dip_id: comision_dip_id || null,
            orden: orden || null,
            id_cargo_dip: id_cargo_dip || null,
            id_agenda,
            usuario_registra: null,
        });
        // Notificar via socket
        const io = req.app.get('io');
        if (io) {
            io.to(`proyeccion-${comision_dip_id}`).emit('voto-registrado', {
                id_diputado: integranteLegislaturaId,
                sentido_voto: Number(sentido_voto),
                id_agenda,
            });
        }
        return res.status(201).json({ msg: 'Voto registrado correctamente', data: voto });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error al registrar voto', error: error.message });
    }
});
exports.registrarVoto = registrarVoto;
// Obtener el estado actual de la sesión activa para el panel del diputado
const getSesionActiva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idComision } = req.params;
        // agendas y puntos_ordens están en la BD registrocomisiones
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
        // Obtener los puntos del orden del día de esa agenda
        const [puntos] = yield registrocomisiones_1.default.query(`
            SELECT po.id, po.punto, po.nopunto, po.observaciones
            FROM puntos_ordens po
            WHERE po.id_evento = :idAgenda
            ORDER BY po.nopunto ASC
        `, { replacements: { idAgenda: agenda.id } });
        return res.json({
            sesionActiva: true,
            agenda,
            puntos,
        });
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
