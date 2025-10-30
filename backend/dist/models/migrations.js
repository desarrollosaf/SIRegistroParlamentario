"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class Migrations extends sequelize_1.Model {
}
// Inicialización
Migrations.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    migration: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    batch: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'migrations',
    timestamps: false,
});
exports.default = Migrations;
