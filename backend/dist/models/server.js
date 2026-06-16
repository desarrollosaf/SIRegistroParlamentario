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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const eventos_1 = __importDefault(require("../routes/eventos"));
const reporte_1 = __importDefault(require("../routes/reporte"));
const estadistico_1 = __importDefault(require("../routes/estadistico"));
const user_1 = __importDefault(require("../routes/user"));
const catalogos_1 = __importDefault(require("../routes/catalogos"));
const diputados_1 = __importDefault(require("../routes/diputados"));
const iniciativas_1 = __importDefault(require("../routes/iniciativas"));
const diputado_1 = __importDefault(require("../routes/diputado"));
const auth_1 = require("../middlewares/auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const comisions_1 = __importDefault(require("./comisions"));
const anfitrion_agendas_1 = __importDefault(require("./anfitrion_agendas"));
class Server {
    constructor() {
        this.asistenciasAbiertas = new Map();
        this.votacionesAbiertas = new Map();
        // Mapa SAF-ID → UUID de registrocomisiones para comisiones
        this.safIdToUUID = new Map();
        // Sesiones activas: clave = idAgenda para comisiones, 'sesion-plenaria' para sesión
        this.sesionesActivas = new Map();
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3013';
        this.httpServer = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: {
                origin: [
                    'https://parlamentario.congresoedomex.gob.mx',
                    'https://nuevapagina.congresoedomex.gob.mx',
                    'http://localhost:4200',
                    'http://localhost:8100',
                    'http://localhost',
                    'https://localhost',
                    'capacitor://localhost',
                    'ionic://localhost',
                ],
                credentials: true
            }
        });
        this.setupSocket();
        this.midlewares();
        this.router();
        this.DBconnetc();
        this.listen();
    }
    /** Resuelve el SAF commission ID a uno o varios UUIDs de registrocomisiones.
     *  Primero intenta el caché, luego consulta AnfitrionAgenda por idAgenda. */
    resolveUUIDs(idComisionSAF, idAgenda) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = this.safIdToUUID.get(idComisionSAF);
            if (cached)
                return [cached];
            try {
                const anfitriones = yield anfitrion_agendas_1.default.findAll({
                    where: { agenda_id: idAgenda },
                    attributes: ['autor_id'],
                    raw: true,
                });
                const uuids = anfitriones.map((a) => a.autor_id).filter(Boolean);
                if (uuids.length > 0) {
                    this.safIdToUUID.set(idComisionSAF, uuids[0]);
                    return uuids;
                }
            }
            catch (_a) { }
            return [idComisionSAF];
        });
    }
    /** Busca en un mapa todos los UUIDs cuyo safId coincide con el SAF commission ID. */
    findUUIDsBySafId(safId, map) {
        const uuids = [];
        for (const [uuid, info] of map.entries()) {
            if (info.safId === safId || uuid === safId) {
                uuids.push(uuid);
            }
        }
        // Fallback: caché
        const cached = this.safIdToUUID.get(safId);
        if (cached && !uuids.includes(cached))
            uuids.push(cached);
        if (uuids.length === 0)
            uuids.push(safId);
        return uuids;
    }
    setupSocket() {
        this.io.on('connection', (socket) => {
            console.log('Socket conectado:', socket.id);
            socket.on('unirse-sesion', (idComision) => {
                socket.join(`proyeccion-${idComision}`);
            });
            socket.on('terminar-votacion', (data) => {
                this.io.to(`proyeccion-${data.idComision}`).emit('votacion-terminada');
            });
            socket.on('terminar-asistencia', (data) => {
                this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-terminada');
            });
            socket.on('iniciar-proyeccion', (data) => {
                this.io.to(`proyeccion-${data.idComision}`).emit('proyeccion-iniciada', data.params);
            });
            // El diputado se une a la sala general y a su sala personal
            socket.on('unirse-diputado', (data) => {
                socket.join('sala-diputados');
                if (data === null || data === void 0 ? void 0 : data.integranteId) {
                    socket.join(`diputado-${data.integranteId}`);
                }
            });
            // Eventos para el panel del diputado
            socket.on('abrir-asistencia', (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Obtener UUIDs desde la sesión activa (fuente más confiable)
                const sesion = this.sesionesActivas.get(data.idAgenda);
                const uuids = ((_a = sesion === null || sesion === void 0 ? void 0 : sesion.idComisiones) === null || _a === void 0 ? void 0 : _a.length)
                    ? sesion.idComisiones
                    : yield this.resolveUUIDs(data.idComision, data.idAgenda);
                for (const uuid of uuids) {
                    this.asistenciasAbiertas.set(uuid, { idAgenda: data.idAgenda, safId: data.idComision, idComisiones: uuids });
                }
                this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-abierta', { idAgenda: data.idAgenda });
                for (const uuid of uuids) {
                    this.io.to('sala-diputados').emit('asistencia-abierta', { idAgenda: data.idAgenda, idComision: uuid });
                }
            }));
            socket.on('cerrar-asistencia', (data) => {
                const uuids = this.findUUIDsBySafId(data.idComision, this.asistenciasAbiertas);
                for (const uuid of uuids) {
                    this.asistenciasAbiertas.delete(uuid);
                }
                this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-cerrada');
                for (const uuid of uuids) {
                    this.io.to('sala-diputados').emit('asistencia-cerrada', { idComision: uuid });
                }
            });
            socket.on('abrir-votacion', (data) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                // Obtener UUIDs desde la sesión activa (fuente más confiable)
                const sesion = this.sesionesActivas.get(data.idAgenda);
                const uuids = ((_a = sesion === null || sesion === void 0 ? void 0 : sesion.idComisiones) === null || _a === void 0 ? void 0 : _a.length)
                    ? sesion.idComisiones
                    : yield this.resolveUUIDs(data.idComision, data.idAgenda);
                for (const uuid of uuids) {
                    this.votacionesAbiertas.set(uuid, {
                        idAgenda: data.idAgenda,
                        punto: data.punto,
                        idPunto: (_b = data.idPunto) !== null && _b !== void 0 ? _b : null,
                        idReserva: (_c = data.idReserva) !== null && _c !== void 0 ? _c : null,
                        idIniciativa: (_d = data.idIniciativa) !== null && _d !== void 0 ? _d : null,
                        safId: data.idComision,
                        idComisiones: uuids,
                    });
                }
                this.io.to(`proyeccion-${data.idComision}`).emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto });
                for (const uuid of uuids) {
                    this.io.to('sala-diputados').emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto, idComision: uuid, idPunto: data.idPunto, idReserva: data.idReserva, idIniciativa: data.idIniciativa });
                }
            }));
            socket.on('cerrar-votacion', (data) => {
                const uuids = this.findUUIDsBySafId(data.idComision, this.votacionesAbiertas);
                for (const uuid of uuids) {
                    this.votacionesAbiertas.delete(uuid);
                }
                this.io.to(`proyeccion-${data.idComision}`).emit('votacion-cerrada');
                for (const uuid of uuids) {
                    this.io.to('sala-diputados').emit('votacion-cerrada', { idComision: uuid });
                }
            });
            // ── Sesiones activas ────────────────────────────────────────────
            socket.on('iniciar-sesion', (data) => __awaiter(this, void 0, void 0, function* () {
                const clave = data.esComision ? data.idAgenda : 'sesion-plenaria';
                // Para sesión plenaria solo puede haber una activa
                if (!data.esComision && this.sesionesActivas.has('sesion-plenaria')) {
                    socket.emit('sesion-rechazada', {
                        motivo: 'Ya existe una sesión plenaria activa',
                        sesionActiva: this.sesionesActivas.get('sesion-plenaria')
                    });
                    return;
                }
                let idComisionUUID = undefined;
                const idComisiones = [];
                // autor_id en anfitrion_agendas ya es el UUID de la comisión en registrocomisiones
                if (data.esComision && data.idAgenda) {
                    try {
                        const anfitriones = yield anfitrion_agendas_1.default.findAll({
                            where: { agenda_id: data.idAgenda },
                            attributes: ['autor_id'],
                            raw: true,
                        });
                        for (const a of anfitriones) {
                            if (a.autor_id && !idComisiones.includes(a.autor_id)) {
                                idComisiones.push(a.autor_id);
                            }
                        }
                        if (idComisiones.length > 0) {
                            idComisionUUID = idComisiones[0];
                            // Poblar cache SAF→UUID para que cerrar-* pueda resolverlo
                            if (data.idComision)
                                this.safIdToUUID.set(data.idComision, idComisiones[0]);
                        }
                    }
                    catch (_a) { }
                }
                // Fallback: si no hubo anfitriones, intentar resolver por nombre
                if (idComisiones.length === 0 && data.esComision && data.titulo) {
                    try {
                        const com = yield comisions_1.default.findOne({ where: { nombre: data.titulo } });
                        if (com === null || com === void 0 ? void 0 : com.id) {
                            idComisionUUID = com.id;
                            if (data.idComision)
                                this.safIdToUUID.set(data.idComision, com.id);
                            idComisiones.push(com.id);
                        }
                    }
                    catch (_b) { }
                }
                const sesion = {
                    idAgenda: data.idAgenda,
                    titulo: data.titulo,
                    fecha: data.fecha,
                    esComision: data.esComision,
                    idComision: idComisionUUID,
                    idComisiones,
                    ordenDia: data.ordenDia,
                    iniciadaEn: new Date().toISOString()
                };
                this.sesionesActivas.set(clave, sesion);
                // Notifica a todos los diputados conectados
                this.io.to('sala-diputados').emit('sesion-iniciada', Object.assign({ clave }, sesion));
                // Notifica a la sala de proyección si aplica
                this.io.to(`proyeccion-${data.idAgenda}`).emit('sesion-iniciada', Object.assign({ clave }, sesion));
                // Confirma al que inició
                socket.emit('sesion-confirmada', Object.assign({ clave }, sesion));
            }));
            socket.on('terminar-sesion', (data) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const clave = data.esComision ? data.idAgenda : 'sesion-plenaria';
                const sesionPrevia = this.sesionesActivas.get(clave);
                this.sesionesActivas.delete(clave);
                let idComisiones = (_a = sesionPrevia === null || sesionPrevia === void 0 ? void 0 : sesionPrevia.idComisiones) !== null && _a !== void 0 ? _a : [];
                // Si no hay UUIDs guardados (sesión iniciada con código viejo), consultar directo
                if (idComisiones.length === 0 && data.esComision && data.idAgenda) {
                    try {
                        const anfitriones = yield anfitrion_agendas_1.default.findAll({
                            where: { agenda_id: data.idAgenda },
                            attributes: ['autor_id'],
                            raw: true,
                        });
                        idComisiones = anfitriones.map((a) => a.autor_id).filter(Boolean);
                    }
                    catch (_d) { }
                }
                const payload = {
                    clave,
                    idAgenda: data.idAgenda,
                    idComision: (_c = (_b = sesionPrevia === null || sesionPrevia === void 0 ? void 0 : sesionPrevia.idComision) !== null && _b !== void 0 ? _b : idComisiones[0]) !== null && _c !== void 0 ? _c : undefined,
                    idComisiones,
                };
                this.io.to('sala-diputados').emit('sesion-terminada', payload);
                this.io.to(`proyeccion-${data.idAgenda}`).emit('sesion-terminada', payload);
            }));
            // Un cliente recién conectado pregunta qué sesiones están activas
            socket.on('get-sesiones-activas', () => {
                const lista = Array.from(this.sesionesActivas.entries()).map(([clave, s]) => (Object.assign({ clave }, s)));
                socket.emit('sesiones-activas', lista);
            });
            // Consulta el estado actual de asistencias y votaciones abiertas
            socket.on('get-estado-eventos', () => {
                const asistencias = Array.from(this.asistenciasAbiertas.entries()).map(([idComision, data]) => (Object.assign({ idComision }, data)));
                const votaciones = Array.from(this.votacionesAbiertas.entries()).map(([idComision, data]) => (Object.assign({ idComision }, data)));
                socket.emit('estado-eventos', { asistencias, votaciones });
            });
            socket.on('disconnect', () => {
                console.log('Socket desconectado:', socket.id);
            });
        });
        this.app.set('io', this.io);
        this.app.set('asistenciasAbiertas', this.asistenciasAbiertas);
        this.app.set('votacionesAbiertas', this.votacionesAbiertas);
        this.app.set('sesionesActivas', this.sesionesActivas);
    }
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log("La aplicación se esta corriendo exitosamente en el puerto => " + this.port);
        });
    }
    router() {
        this.app.use(eventos_1.default);
        this.app.use(user_1.default);
        this.app.use(diputados_1.default);
        this.app.use(catalogos_1.default);
        this.app.use(reporte_1.default);
        this.app.use(iniciativas_1.default);
        this.app.use(estadistico_1.default);
        this.app.use(diputado_1.default);
    }
    midlewares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)({
            origin: function (origin, callback) {
                const allowedOrigins = [
                    'https://parlamentario.congresoedomex.gob.mx',
                    'https://nuevapagina.congresoedomex.gob.mx',
                    'https://congresoedomex.gob.mx',
                    'https://www.congresoedomex.gob.mx',
                    'capacitor://localhost',
                    'ionic://localhost',
                    'https://localhost',
                ];
                const isLocalhost = !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin);
                if (isLocalhost || allowedOrigins.includes(origin !== null && origin !== void 0 ? origin : '')) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use('/storage', express_1.default.static(path_1.default.join(process.cwd(), 'storage')));
        this.app.use((req, res, next) => {
            const publicPaths = [
                '/api/user/login',
                '/api/eventos/gettipos/',
                '/api/diputados/cargo/',
                '/api/eventos/savereserva/',
                '/api/eventos/eliminarreserva/',
                '/api/diputados/getinfiniciativa/',
                '/api/eventos/asintenciapdf/',
                '/api/diputados/getinfiniciativa/',
                '/api/eventos/votacionpunto/',
                '/api/reporte/iniciativas/general/',
                '/api/reporte/iniciativas/en-estudio/',
                '/api/reporte/iniciativas/aprobadas/',
                '/api/reporte/iniciativas/grupo-diputado/',
                '/api/reporte/iniciativas/totales-periodo/',
                '/api/reporte/iniciativas/integrantes/',
                '/api/reporte/iniciativas/estadisticas/',
                '/api/iniciativas/iniciativas/',
                '/api/estadistico/iniciativas/resumen',
                '/api/estadistico/diputado/iniciativas',
                '/api/estadistico/comision/iniciativas',
                '/api/estadistico/getvotospunto/',
                '/api/estadistico/geteventos/',
                '/api/estadistico/getasistencia/',
                '/api/estadistico/ultimasesion/',
                '/api/estadistico/getordendia',
                '/api/estadistico/pdfordendia/',
                '/api/estadistico/comision/eventos/',
                '/api/eventos/getevento/',
                '/api/eventos/getpuntos/',
                '/api/eventos/getvotospunto/',
                '/api/estadistico/getordenes',
                '/api/diputado/crear-cuentas',
            ];
            const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));
            if (isPublic) {
                return next();
            }
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            return (0, auth_1.verifyToken)(req, res, next);
        });
    }
    DBconnetc() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Conexion de DB exitoso");
            }
            catch (error) {
                console.log("Conexion de DB errorena => " + error);
            }
        });
    }
}
exports.default = Server;
