"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const estatus_diputados_1 = __importDefault(require("./estatus_diputados"));
class MovimientosDiputados extends sequelize_1.Model {
}
// Inicialización
MovimientosDiputados.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    fecha_movimiento: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    estatus_diputado_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'estatus_diputados',
            key: 'id',
        },
    },
    dato_user_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'movimientos_diputados',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
MovimientosDiputados.belongsTo(datos_users_1.default, { foreignKey: 'dato_user_id', as: 'dato_user' });
MovimientosDiputados.belongsTo(estatus_diputados_1.default, { foreignKey: 'estatus_diputado_id', as: 'estatus_diputado' });
exports.default = MovimientosDiputados;
