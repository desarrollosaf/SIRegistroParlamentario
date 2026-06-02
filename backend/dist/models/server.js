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
class Server {
    constructor() {
        this.asistenciasAbiertas = new Map();
        this.votacionesAbiertas = new Map();
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3013';
        this.httpServer = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: {
                origin: ['https://parlamentario.congresoedomex.gob.mx', 'https://nuevapagina.congresoedomex.gob.mx', 'http://localhost:4200'],
                credentials: true
            }
        });
        this.setupSocket();
        this.midlewares();
        this.router();
        this.DBconnetc();
        this.listen();
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
            // El diputado se une a la sala general para recibir eventos
            socket.on('unirse-diputado', () => {
                socket.join('sala-diputados');
            });
            // Eventos para el panel del diputado
            socket.on('abrir-asistencia', (data) => {
                this.asistenciasAbiertas.set(data.idComision, { idAgenda: data.idAgenda });
                this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-abierta', { idAgenda: data.idAgenda });
                this.io.to('sala-diputados').emit('asistencia-abierta', { idAgenda: data.idAgenda, idComision: data.idComision });
            });
            socket.on('cerrar-asistencia', (data) => {
                this.asistenciasAbiertas.delete(data.idComision);
                this.io.to(`proyeccion-${data.idComision}`).emit('asistencia-cerrada');
                this.io.to('sala-diputados').emit('asistencia-cerrada', { idComision: data.idComision });
            });
            socket.on('abrir-votacion', (data) => {
                var _a, _b, _c;
                this.votacionesAbiertas.set(data.idComision, {
                    idAgenda: data.idAgenda,
                    punto: data.punto,
                    idPunto: (_a = data.idPunto) !== null && _a !== void 0 ? _a : null,
                    idReserva: (_b = data.idReserva) !== null && _b !== void 0 ? _b : null,
                    idIniciativa: (_c = data.idIniciativa) !== null && _c !== void 0 ? _c : null,
                });
                this.io.to(`proyeccion-${data.idComision}`).emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto });
                this.io.to('sala-diputados').emit('votacion-abierta', { idAgenda: data.idAgenda, punto: data.punto, idComision: data.idComision, idPunto: data.idPunto, idReserva: data.idReserva, idIniciativa: data.idIniciativa });
            });
            socket.on('cerrar-votacion', (data) => {
                this.votacionesAbiertas.delete(data.idComision);
                this.io.to(`proyeccion-${data.idComision}`).emit('votacion-cerrada');
                this.io.to('sala-diputados').emit('votacion-cerrada', { idComision: data.idComision });
            });
            socket.on('disconnect', () => {
                console.log('Socket desconectado:', socket.id);
            });
        });
        this.app.set('io', this.io);
        this.app.set('asistenciasAbiertas', this.asistenciasAbiertas);
        this.app.set('votacionesAbiertas', this.votacionesAbiertas);
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
                const allowedOrigins = ['https://parlamentario.congresoedomex.gob.mx', 'https://nuevapagina.congresoedomex.gob.mx', 'https://congresoedomex.gob.mx', 'https://www.congresoedomex.gob.mx', 'http://localhost:4200'];
                if (!origin || allowedOrigins.includes(origin)) {
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
