"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class TipoCategoriaIniciativas extends sequelize_1.Model {
}
TipoCategoriaIniciativas.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
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
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'tipo_categoria_iniciativas',
    timestamps: true,
    paranoid: false,
});
// TipoCategoriaIniciativas.hasMany(ProponentesTipoCategoriaDetalle, {
//   foreignKey: 'proponente_id', as: 'proponentes_tipo_categoria_detalle'
// });
exports.default = TipoCategoriaIniciativas;
