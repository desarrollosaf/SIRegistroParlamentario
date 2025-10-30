"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sedes = void 0;
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
class Sedes extends sequelize_1.Model {
}
exports.Sedes = Sedes;
Sedes.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    sede: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'sedes',
    timestamps: true,
});
exports.default = Sedes;
