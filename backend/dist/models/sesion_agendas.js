"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesionAgendas = void 0;
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class SesionAgendas extends sequelize_1.Model {
}
exports.SesionAgendas = SesionAgendas;
SesionAgendas.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    sesionesId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'sesiones',
            key: 'id',
        },
    },
    agendaId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'agendas',
            key: 'id',
        },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'sesion_agendas',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: ['id'],
        },
        {
            name: 'sesion_agendas_sesiones_id_foreign',
            using: 'BTREE',
            fields: ['sesionesId'],
        },
        {
            name: 'sesion_agendas_agenda_id_foreign',
            using: 'BTREE',
            fields: ['agendaId'],
        },
    ],
});
exports.default = SesionAgendas;
