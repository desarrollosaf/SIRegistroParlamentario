"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
class Partidos extends sequelize_1.Model {
}
// Inicialización
Partidos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    siglas: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    emblema: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    rgb: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    rgb2: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        field: 'deleted_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'partidos',
    timestamps: true,
    paranoid: true,
});
// Asociación
Partidos.hasMany(integrante_legislaturas_1.default, { foreignKey: 'partido_id', as: 'integrante_legislaturas' });
exports.default = Partidos;
