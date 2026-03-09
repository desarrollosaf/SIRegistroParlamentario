"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const proponentes_1 = __importDefault(require("./proponentes"));
class IniciativasPresenta extends sequelize_1.Model {
}
IniciativasPresenta.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_iniciativa: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
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
        field: 'createdAt',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt',
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'deletedAt',
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'iniciativas_presenta',
    paranoid: true, // 👈 para soft delete con deletedAt
    timestamps: true,
});
IniciativasPresenta.belongsTo(proponentes_1.default, { foreignKey: 'id_tipo_presenta', as: 'tipo_presenta' });
exports.default = IniciativasPresenta;
