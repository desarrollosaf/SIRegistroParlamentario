"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class ProponentesTipoCategoriaDetalle extends sequelize_1.Model {
}
ProponentesTipoCategoriaDetalle.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    proponente_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    tipo_categoria_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'proponentes_tipo_categoria_detalle',
    timestamps: true,
});
// TipoCategoriaIniciativas.belongsToMany(Proponentes, {
//   through: ProponentesTipoCategoriaDetalle,
//   foreignKey: 'tipo_categoria_id',
//   otherKey: 'proponente_id',
//   as: 'proponentes',
// });
// TipoCategoriaIniciativas.belongsToMany(Proponentes, {
//   through: ProponentesTipoCategoriaDetalle,
//   foreignKey: 'tipo_categoria_id',
//   otherKey: 'proponente_id',
//   as: 'proponentes',
// });
exports.default = ProponentesTipoCategoriaDetalle;
