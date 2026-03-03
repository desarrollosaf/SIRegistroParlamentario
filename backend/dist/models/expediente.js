"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class Expediente extends sequelize_1.Model {
}
Expediente.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    evento_comision_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'createdAt',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt',
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'expedientes',
    timestamps: true,
    paranoid: true,
});
exports.default = Expediente;
