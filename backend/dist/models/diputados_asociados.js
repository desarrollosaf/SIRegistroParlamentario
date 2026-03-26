"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class DiputadosAsociados extends sequelize_1.Model {
}
DiputadosAsociados.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    partido_dip: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    comision_dip_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_cargo_dip: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_agenda: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
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
    tableName: 'diputados_asociados',
    timestamps: true,
    paranoid: true,
});
exports.default = DiputadosAsociados;
