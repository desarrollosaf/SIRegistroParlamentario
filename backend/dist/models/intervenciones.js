"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
const tipo_intervencions_1 = __importDefault(require("./tipo_intervencions"));
const agendas_1 = __importDefault(require("./agendas"));
class Intervencion extends sequelize_1.Model {
}
Intervencion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    id_punto: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_tipo_intervencion: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    mensaje: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    tipo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    liga: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    destacado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "intervenciones",
    timestamps: true,
    paranoid: true,
});
Intervencion.belongsTo(tipo_intervencions_1.default, { foreignKey: 'id_tipo_intervencion', as: 'tipointerven' });
Intervencion.belongsTo(puntos_ordens_1.default, { foreignKey: 'id_punto', as: 'punto' });
Intervencion.belongsTo(agendas_1.default, { foreignKey: 'id_evento', as: 'evento' });
exports.default = Intervencion;
