"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
/** Cada intervención transcrita (una línea del audio). */
class TranscripcionParticipacion extends sequelize_1.Model {
}
TranscripcionParticipacion.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    id_sesion: { type: sequelize_1.DataTypes.CHAR(36), allowNull: false },
    orden: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    orador: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    inicio_seg: { type: sequelize_1.DataTypes.FLOAT, allowNull: true },
    fin_seg: { type: sequelize_1.DataTypes.FLOAT, allowNull: true },
    inicio_hms: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    fin_hms: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    texto: { type: sequelize_1.DataTypes.TEXT('long'), allowNull: true },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'transcripcion_participaciones',
    timestamps: true,
    indexes: [{ fields: ['id_sesion'] }],
});
exports.default = TranscripcionParticipacion;
