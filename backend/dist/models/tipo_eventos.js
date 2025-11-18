"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
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
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'tipo_eventos',
    timestamps: true,
});
// Asociaciones
// TipoEventos.hasMany(Agendas, { foreignKey: 'tipo_evento_id', as: 'agendas' });
exports.default = TipoEventos;
