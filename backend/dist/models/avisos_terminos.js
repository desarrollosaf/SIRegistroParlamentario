"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
class AvisoTermino extends sequelize_1.Model {
}
AvisoTermino.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    rfc_usuario: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    path_aviso: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    path_terminos: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'avisos_terminos',
    timestamps: true,
});
exports.default = AvisoTermino;
