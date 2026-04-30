"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
const tipo_presentas_1 = __importDefault(require("./tipo_presentas"));
class PresentanPuntos extends sequelize_1.Model {
}
// Inicialización
PresentanPuntos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_punto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'puntos_ordens',
            key: 'id',
        },
    },
    id_tipo_presenta: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'tipo_presentas',
            key: 'id',
        },
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    otro: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    id_comision: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_grupo: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_presenta_titular: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_proponente: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'presentan_puntos',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
PresentanPuntos.belongsTo(datos_users_1.default, { foreignKey: 'id_diputado', as: 'id_diputado_datos_user' });
PresentanPuntos.belongsTo(puntos_ordens_1.default, { foreignKey: 'id_punto', as: 'id_punto_puntos_orden' });
PresentanPuntos.belongsTo(tipo_presentas_1.default, { foreignKey: 'id_tipo_presenta', as: 'id_tipo_presenta_tipo_presenta' });
exports.default = PresentanPuntos;
