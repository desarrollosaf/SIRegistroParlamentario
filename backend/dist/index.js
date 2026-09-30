"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // carga .env antes que cualquier módulo lea process.env
// import SUsuario from "./models/saf/s_usuario"
// import Departamento from "./models/saf/t_departamento"
// import Dependencia from "./models/saf/t_dependencia"
// import Direccion from "./models/saf/t_direccion"
const server_1 = __importDefault(require("./models/server"));
require("./models/associations");
const spidVotingSync_1 = require("./services/spidVotingSync");
// Red de seguridad: evita que un error no capturado (fuera de los handlers de
// socket, que ya están protegidos) tumbe el proceso completo en producción.
process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});
const server = new server_1.default();
// Plan de contingencia: espejo (solo lectura) de spid hacia este backend.
// Opt-in vía SPID_SYNC_ENABLED, ver services/spidVotingSync.ts.
(0, spidVotingSync_1.startSpidVotingSync)(server.getApp());
const models = {
// SUsuario,
// Dependencia, 
// Direccion,
// Departamento,
};
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});
exports.default = models;
