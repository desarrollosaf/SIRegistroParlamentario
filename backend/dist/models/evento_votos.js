"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class EventoVotos extends sequelize_1.Model {
}
EventoVotos.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    fechaEvento: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        field: 'fechaEvento',
    },
    horaEvento: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
        field: 'horaEvento',
    },
    nombreEvento: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'nombreEvento',
    },
    tipoEvento: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'tipoEvento',
    },
    idUsuario: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'idUsuario',
    },
    random: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tipoEventoIntegrantes: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'tipoEventoIntegrantes',
    },
    estatus: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    noSesion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'noSesion',
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
    sequelize: legislativoConnection_1.default,
    tableName: 'evento_votos',
    timestamps: true,
    underscored: true,
});
exports.default = EventoVotos;
