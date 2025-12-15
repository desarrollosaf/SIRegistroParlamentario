"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class PuntosComisiones extends sequelize_1.Model {
}
PuntosComisiones.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_punto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "puntos_ordens",
            key: "id",
        },
    },
    id_comision: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_punto_turno: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "puntos_comisiones",
    timestamps: true,
    paranoid: false,
    underscored: false,
});
// RELACIONES
// PuntosComisiones.belongsTo(PuntosOrden, {
//   foreignKey: "id_punto",
//   as: "punto",
// });
// PuntosOrden.hasMany(PuntosComisiones, {
//   foreignKey: "id_punto",
//   as: "comisiones",
// });
exports.default = PuntosComisiones;
