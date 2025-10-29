"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const sesiones_1 = __importDefault(require("./sesiones"));
class AsistenciaVoto extends sequelize_1.Model {
}
AsistenciaVoto.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    mensaje: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    id_sesion: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    votacionActiva: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    banderaC: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    randomCU: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    tiempoVotacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    tiempoVotacionInicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    usuario_registra: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'asistencia_votos',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
AsistenciaVoto.belongsTo(datos_users_1.default, { foreignKey: 'id_diputado', as: 'diputado' });
AsistenciaVoto.belongsTo(sesiones_1.default, { foreignKey: 'id_sesion', as: 'sesion' });
exports.default = AsistenciaVoto;
