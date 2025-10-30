"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuntosOrdens = void 0;
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class PuntosOrdens extends sequelize_1.Model {
}
exports.PuntosOrdens = PuntosOrdens;
PuntosOrdens.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    noPunto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    punto: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    path_doc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tribuna: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    id_tipo: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'tipo_categoria_iniciativas',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },
    punto_turno_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_proponente: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    dispensa: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    editado: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'puntos_ordens',
    timestamps: true,
    paranoid: true,
});
exports.default = PuntosOrdens;
