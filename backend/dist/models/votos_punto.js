"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class VotosPunto extends sequelize_1.Model {
}
VotosPunto.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    sentido: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    mensaje: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    id_tema_punto_voto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_partido: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_comision_dip: {
        type: sequelize_1.DataTypes.CHAR(36),
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
    tableName: "votos_punto",
    timestamps: true,
    paranoid: true,
});
exports.default = VotosPunto;
