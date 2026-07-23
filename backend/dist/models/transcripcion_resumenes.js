"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
/** Resumen ejecutivo (generado con Claude) de un turno de intervención.
 *  Se ancla al id de la primera participación del turno (ancla_id). */
class TranscripcionResumen extends sequelize_1.Model {
}
TranscripcionResumen.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_sesion: { type: sequelize_1.DataTypes.CHAR(36), allowNull: false },
    ancla_id: { type: sequelize_1.DataTypes.CHAR(36), allowNull: false, unique: true },
    orador: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    resumen: { type: sequelize_1.DataTypes.TEXT('long'), allowNull: true },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
}, { sequelize: registrocomisiones_1.default, tableName: 'transcripcion_resumenes', timestamps: true });
exports.default = TranscripcionResumen;
