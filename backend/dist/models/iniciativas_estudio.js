"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
class IniciativaEstudio extends sequelize_1.Model {
}
IniciativaEstudio.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_iniciativa: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_punto_evento: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "iniciativas_estudios",
    timestamps: true,
    paranoid: true,
});
IniciativaEstudio.belongsTo(puntos_ordens_1.default, {
    foreignKey: 'id_punto_evento',
    as: 'puntoEvento'
});
exports.default = IniciativaEstudio;
