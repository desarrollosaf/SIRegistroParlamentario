"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
class PresentaPuntos extends sequelize_1.Model {
}
// Inicialización
PresentaPuntos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_presenta: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    id_punto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'puntos_ordens',
            key: 'id',
        },
    },
    tipo_presenta: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        comment: '0 diputados, 1 grupo parlamentario',
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'presenta_puntos',
    timestamps: true,
});
// Asociaciones
PresentaPuntos.belongsTo(datos_users_1.default, { foreignKey: 'id_presenta', as: 'id_presenta_datos_user' });
PresentaPuntos.belongsTo(puntos_ordens_1.default, { foreignKey: 'id_punto', as: 'id_punto_puntos_orden' });
exports.default = PresentaPuntos;
