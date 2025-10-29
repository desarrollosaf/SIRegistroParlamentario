"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
class Dialogo extends sequelize_1.Model {
}
Dialogo.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    no_dialogo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    anio: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
    },
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'dialogos',
    timestamps: true,
    underscored: true, // usa created_at y updated_at
});
exports.default = Dialogo;
