"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const sesiones_1 = __importDefault(require("./sesiones"));
class AnioSesion extends sequelize_1.Model {
}
AnioSesion.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'anio_sesions',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
AnioSesion.hasMany(sesiones_1.default, { foreignKey: 'anio_id', as: 'sesiones' });
exports.default = AnioSesion;
