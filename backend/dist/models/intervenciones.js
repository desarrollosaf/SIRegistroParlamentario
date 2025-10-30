"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class Intervencion extends sequelize_1.Model {
}
// Inicialización
Intervencion.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_punto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_tipo_intervencion: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'intervenciones',
    timestamps: true,
});
exports.default = Intervencion;
