"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const estatus_diputados_1 = __importDefault(require("./estatus_diputados"));
class LicenciaDiputado extends sequelize_1.Model {
}
// Inicialización del modelo
LicenciaDiputado.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    diputado_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    estatus_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_termino: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    diputado_suplente_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'licencias_diputados',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
LicenciaDiputado.belongsTo(datos_users_1.default, {
    foreignKey: 'diputado_id',
    as: 'diputado',
});
LicenciaDiputado.belongsTo(datos_users_1.default, {
    foreignKey: 'diputado_suplente_id',
    as: 'diputado_suplente',
});
LicenciaDiputado.belongsTo(estatus_diputados_1.default, {
    foreignKey: 'estatus_diputado',
    as: 'estatus',
});
exports.default = LicenciaDiputado;
