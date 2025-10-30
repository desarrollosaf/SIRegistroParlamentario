"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class ComisionUsuario extends sequelize_1.Model {
}
ComisionUsuario.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    id_comision: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    id_cargo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'comision_usuarios',
    timestamps: true,
});
exports.default = ComisionUsuario;
