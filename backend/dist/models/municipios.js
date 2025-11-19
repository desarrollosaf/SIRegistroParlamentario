"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class Municipios extends sequelize_1.Model {
}
Municipios.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    municipio: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cabecera: {
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
    sequelize: registrocomisiones_1.default,
    tableName: 'municipios',
    timestamps: true,
});
// Municipios.hasMany(Distritos, { foreignKey: 'municipio_id', as: 'distritos' });
exports.default = Municipios;
