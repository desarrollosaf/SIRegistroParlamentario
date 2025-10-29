"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
const agendas_1 = __importDefault(require("./agendas"));
class TipoEventos extends sequelize_1.Model {
}
// Inicialización
TipoEventos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'tipo_eventos',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
TipoEventos.hasMany(agendas_1.default, { foreignKey: 'tipo_evento_id', as: 'agendas' });
exports.default = TipoEventos;
