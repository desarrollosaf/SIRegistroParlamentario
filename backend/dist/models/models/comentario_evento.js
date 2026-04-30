"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const agendas_1 = __importDefault(require("./agendas"));
class ComentarioEvento extends sequelize_1.Model {
}
ComentarioEvento.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    comentario: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'createdAt'
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt'
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'comentarios_evento',
    timestamps: true
});
// Asociación
ComentarioEvento.belongsTo(agendas_1.default, { foreignKey: 'id_evento', as: 'agenda' });
agendas_1.default.hasMany(ComentarioEvento, { foreignKey: 'id_evento', as: 'comentarios' });
exports.default = ComentarioEvento;
