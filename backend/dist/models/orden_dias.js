"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
class OrdenDias extends sequelize_1.Model {
}
// Inicialización
OrdenDias.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    path_orden: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    id_evento: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'orden_dias',
    timestamps: true,
});
exports.default = OrdenDias;
