"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const distritos_1 = __importDefault(require("./distritos"));
class Municipios extends sequelize_1.Model {
}
// Inicialización
Municipios.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    municipio: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cabecera: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'municipios',
    timestamps: true,
});
// Asociaciones
Municipios.hasMany(distritos_1.default, { foreignKey: 'municipio_id', as: 'distritos' });
exports.default = Municipios;
