"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
class Legislatura extends sequelize_1.Model {
}
// Inicialización
Legislatura.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    numero: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        field: 'deleted_at',
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'legislaturas',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
Legislatura.hasMany(integrante_legislaturas_1.default, {
    foreignKey: 'legislatura_id',
    as: 'integrante_legislaturas',
});
exports.default = Legislatura;
