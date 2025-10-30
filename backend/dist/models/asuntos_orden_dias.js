"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const sesiones_1 = __importDefault(require("./sesiones"));
class AsuntoOrdenDia extends sequelize_1.Model {
}
AsuntoOrdenDia.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    path_asuntos: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    puntos: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    publico: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'asuntos_orden_dias',
    timestamps: true,
});
// 👇 Asociaciones
AsuntoOrdenDia.belongsTo(sesiones_1.default, { foreignKey: 'id_evento', as: 'sesion' });
exports.default = AsuntoOrdenDia;
