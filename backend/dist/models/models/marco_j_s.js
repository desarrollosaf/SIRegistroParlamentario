"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const dependencia_documentos_1 = __importDefault(require("./dependencia_documentos"));
class MarcoJ extends sequelize_1.Model {
}
MarcoJ.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre_doc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    liga: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tipoDoc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    file_doc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'marco_j_s',
    timestamps: true,
});
// Asociaciones
MarcoJ.hasMany(dependencia_documentos_1.default, {
    foreignKey: 'id_marcoj',
    as: 'dependencia_documentos',
});
exports.default = MarcoJ;
