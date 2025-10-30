"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class AsistenciaVoto extends sequelize_1.Model {
}
AsistenciaVoto.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    sentido_voto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    mensaje: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    partido_dip: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    id_agenda: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    usuario_registra: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        field: 'deleted_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'asistencia_votos',
    timestamps: true,
    paranoid: true,
});
// AsistenciaVoto.belongsTo(Sesion, { foreignKey: 'id_agenda', as: 'sesion' });
exports.default = AsistenciaVoto;
