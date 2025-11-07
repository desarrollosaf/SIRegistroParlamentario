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
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3008';
        this.midlewares();
        this.router();
        this.DBconnetc();
        this.listen();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("La aplicación se esta corriendo exitosamente en el puerto => " + this.port);
        });
    }
    router() {
        this.app.use(eventos_1.default);
    }
    midlewares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)({
            origin: 'http://localhost:4200',
            //origin: 'https://ofrendas.congresoedomex.gob.mx',
            credentials: true
        }));
        this.app.use('/storage', express_1.default.static(path_1.default.join(process.cwd(), 'storage')));
        this.app.use((req, res, next) => {
            const publicPaths = [
                '/api/user/login',
                '/api/eventos/geteventos/',
                '/api/eventos/getevento/',
                '/api/eventos/actasistencia/',
                '/api/eventos/catalogos/',
                '/api/eventos/gettipos/',
                '/api/eventos/savepunto/',
                '/api/eventos/getpuntos/',
                '/api/eventos/actualizarPunto/',
                '/api/eventos/eliminarpunto/',
                '/api/eventos/saveintervencion/',
                '/api/eventos/getintervenciones/'
            ];
            const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));
            if (isPublic) {
                return next();
            }
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
