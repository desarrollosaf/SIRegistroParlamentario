"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const votos_punto_1 = __importDefault(require("./votos_punto"));
class TemasPuntosVotos extends sequelize_1.Model {
}
TemasPuntosVotos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    id_punto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    tema_votacion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fecha_votacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: {
        allowNull: true,
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        allowNull: true,
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        allowNull: true,
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "temas_puntos_votos",
    timestamps: true,
    paranoid: true,
});
TemasPuntosVotos.hasMany(votos_punto_1.default, {
    foreignKey: "id_tema_punto_voto",
    as: "votospuntos",
});
exports.default = TemasPuntosVotos;
