"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class AnfitrionAgenda extends sequelize_1.Model {
}
AnfitrionAgenda.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
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
    sequelize: registrocomisiones_1.default,
    tableName: 'anfitrion_agendas',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
// AnfitrionAgenda.belongsTo(Agenda, { foreignKey: 'agenda_id', as: 'agenda' });
exports.default = AnfitrionAgenda;
