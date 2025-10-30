"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
const agendas_1 = __importDefault(require("./agendas"));
class AnfitrionAgenda extends sequelize_1.Model {
}
AnfitrionAgenda.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    agenda_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    tipo_autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'deleted_at',
    },
}, {
    sequelize: pleno_1.default,
    tableName: 'anfitrion_agendas',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
AnfitrionAgenda.belongsTo(agendas_1.default, { foreignKey: 'agenda_id', as: 'agenda' });
exports.default = AnfitrionAgenda;
