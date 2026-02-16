"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
const agendas_1 = __importDefault(require("./agendas"));
class IniciativaPuntoOrden extends sequelize_1.Model {
}
IniciativaPuntoOrden.init({
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
        allowNull: false,
    },
    iniciativa: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    fecha_votacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
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
    tableName: "inciativas_puntos_ordens",
    timestamps: true,
    paranoid: true,
});
IniciativaPuntoOrden.belongsTo(puntos_ordens_1.default, { foreignKey: 'id_punto', as: 'punto' });
IniciativaPuntoOrden.belongsTo(agendas_1.default, { foreignKey: 'id_evento', as: 'evento' });
exports.default = IniciativaPuntoOrden;
