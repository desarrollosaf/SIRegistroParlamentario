"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const sesiones_1 = __importDefault(require("./sesiones"));
const temas_votos_1 = __importDefault(require("./temas_votos"));
class MensajesVotos extends sequelize_1.Model {
}
// Inicialización
MensajesVotos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    sentido: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    id_tema_voto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    id_usuario_registra: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    grupo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'mensajes_votos',
    timestamps: true,
});
// Asociaciones
MensajesVotos.belongsTo(datos_users_1.default, { foreignKey: 'id_diputado', as: 'diputado' });
MensajesVotos.belongsTo(datos_users_1.default, { foreignKey: 'id_usuario_registra', as: 'usuario_registra' });
MensajesVotos.belongsTo(sesiones_1.default, { foreignKey: 'id_evento', as: 'evento' });
MensajesVotos.belongsTo(temas_votos_1.default, { foreignKey: 'id_tema_voto', as: 'tema_voto' });
exports.default = MensajesVotos;
