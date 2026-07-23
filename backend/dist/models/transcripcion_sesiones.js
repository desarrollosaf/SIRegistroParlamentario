"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
/** Una corrida de transcripción de una sesión (agenda). */
class TranscripcionSesion extends sequelize_1.Model {
}
TranscripcionSesion.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_agenda: { type: sequelize_1.DataTypes.CHAR(36), allowNull: false },
    titulo: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    url: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    inicio: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    fin: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
}, { sequelize: registrocomisiones_1.default, tableName: 'transcripcion_sesiones', timestamps: true });
exports.default = TranscripcionSesion;
