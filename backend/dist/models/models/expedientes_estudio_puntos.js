"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class ExpedienteEstudiosPuntos extends sequelize_1.Model {
}
ExpedienteEstudiosPuntos.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    expediente_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    punto_origen_sesion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'createdAt',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt',
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'expedientes_estudio_puntos',
    timestamps: true,
    paranoid: false,
});
exports.default = ExpedienteEstudiosPuntos;
