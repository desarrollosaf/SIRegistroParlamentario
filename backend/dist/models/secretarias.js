"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Secretarias = void 0;
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class Secretarias extends sequelize_1.Model {
}
exports.Secretarias = Secretarias;
Secretarias.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    titular: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'createdAt'
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt'
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'secretarias',
    timestamps: true
});
exports.default = Secretarias;
