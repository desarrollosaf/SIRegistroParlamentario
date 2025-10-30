"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
const sesiones_1 = __importDefault(require("./sesiones"));
class PeriodoSesions extends sequelize_1.Model {
}
// Inicialización
PeriodoSesions.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'periodo_sesions',
    timestamps: true,
    paranoid: true,
});
// Asociación
PeriodoSesions.hasMany(sesiones_1.default, { foreignKey: 'periodo_id', as: 'sesiones' });
exports.default = PeriodoSesions;
