"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
class TipoCategoriaIniciativas extends sequelize_1.Model {
}
TipoCategoriaIniciativas.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
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
    sequelize: pleno_1.default,
    tableName: 'tipo_categoria_iniciativas',
    timestamps: true,
    paranoid: true,
});
exports.default = TipoCategoriaIniciativas;
