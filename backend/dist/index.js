"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import SUsuario from "./models/saf/s_usuario"
// import Departamento from "./models/saf/t_departamento"
// import Dependencia from "./models/saf/t_dependencia"
// import Direccion from "./models/saf/t_direccion"
const server_1 = __importDefault(require("./models/server"));
const server = new server_1.default();
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
