"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
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
    sequelize: legislativoConnection_1.default,
    tableName: 'comisions',
    timestamps: true,
    paranoid: true,
    underscored: true,
});
// Comision.hasMany(IntegranteComision, {
//   foreignKey: 'comision_id',
//   as: 'integrantes',
// });
// Comision.hasMany(TurnoComision, {
//   foreignKey: 'comision_id', 
//   as: 'turnos',
// });
// Comision.belongsTo(TipoComision, {
//   foreignKey: 'tipo_comision_id',
//   as: 'tipo_comision',
// });
exports.default = Comision;
