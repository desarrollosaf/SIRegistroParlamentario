"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const comisions_1 = __importDefault(require("./comisions"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
const tipo_cargo_comisions_1 = __importDefault(require("./tipo_cargo_comisions"));
class IntegranteComision extends sequelize_1.Model {
}
// Inicialización
IntegranteComision.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    integrante_legislatura_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    tipo_cargo_comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    nivel: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'integrante_comisions',
    timestamps: true,
    paranoid: true, // activa soft delete
});
// Asociaciones
IntegranteComision.belongsTo(comisions_1.default, {
    foreignKey: 'comision_id',
    as: 'comision',
});
IntegranteComision.belongsTo(integrante_legislaturas_1.default, {
    foreignKey: 'integrante_legislatura_id',
    as: 'integrante_legislatura',
});
IntegranteComision.belongsTo(tipo_cargo_comisions_1.default, {
    foreignKey: 'tipo_cargo_comision_id',
    as: 'tipo_cargo_comision',
});
exports.default = IntegranteComision;
