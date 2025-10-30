"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const integrante_comisions_1 = __importDefault(require("./integrante_comisions"));
const tipo_comisions_1 = __importDefault(require("./tipo_comisions"));
const turno_comisions_1 = __importDefault(require("./turno_comisions"));
class Comision extends sequelize_1.Model {
}
Comision.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    importancia: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tipo_comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    alias: {
        type: sequelize_1.DataTypes.STRING(255),
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
    sequelize: parlamentariosConnection_1.default,
    tableName: 'comisions',
    timestamps: true,
    paranoid: true,
    underscored: true, // 👈 Hace que use snake_case en BD (opcional pero recomendado)
});
// 🔗 Asociaciones
Comision.hasMany(integrante_comisions_1.default, {
    foreignKey: 'comision_id',
    as: 'integrantes',
});
Comision.hasMany(turno_comisions_1.default, {
    foreignKey: 'comision_id', // 👈 cambiado de id_comision → comision_id para consistencia
    as: 'turnos',
});
Comision.belongsTo(tipo_comisions_1.default, {
    foreignKey: 'tipo_comision_id',
    as: 'tipo_comision',
});
exports.default = Comision;
