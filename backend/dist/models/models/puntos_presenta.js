"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuntosPresenta = void 0;
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const proponentes_1 = __importDefault(require("./proponentes"));
class PuntosPresenta extends sequelize_1.Model {
}
exports.PuntosPresenta = PuntosPresenta;
PuntosPresenta.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    id_punto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'puntos_ordens',
            key: 'id',
        },
    },
    id_tipo_presenta: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    id_presenta: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
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
    tableName: 'puntos_presenta',
    timestamps: true,
});
PuntosPresenta.belongsTo(proponentes_1.default, { foreignKey: 'id_tipo_presenta', as: 'tipo_presenta' });
exports.default = PuntosPresenta;
