"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
class OtrosAutores extends sequelize_1.Model {
}
// Inicialización
OtrosAutores.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'otros_autores',
    timestamps: true,
    paranoid: true,
});
exports.default = OtrosAutores;
