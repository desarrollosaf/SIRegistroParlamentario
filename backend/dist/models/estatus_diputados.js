"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");

const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));

const licencias_diputados_1 = __importDefault(require("./licencias_diputados"));
const movimientos_diputados_1 = __importDefault(require("./movimientos_diputados"));
class EstatusDiputados extends sequelize_1.Model {
}
EstatusDiputados.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
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
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'deleted_at',
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'estatus_diputados',
    timestamps: true,
    paranoid: true,
    underscored: true,
});
// Relaciones
EstatusDiputados.hasMany(licencias_diputados_1.default, { foreignKey: 'estatus_diputado', as: 'licencias' });
EstatusDiputados.hasMany(movimientos_diputados_1.default, { foreignKey: 'estatus_diputado_id', as: 'movimientos' });
exports.default = EstatusDiputados;
