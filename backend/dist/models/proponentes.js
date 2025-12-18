"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const tipo_categoria_iniciativas_1 = __importDefault(require("./tipo_categoria_iniciativas"));
const ProponentesTipoCategoriaDetalle_1 = __importDefault(require("./ProponentesTipoCategoriaDetalle"));
class Proponentes extends sequelize_1.Model {
}
Proponentes.init({
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
    tipo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
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
    tableName: 'proponentes',
    timestamps: true,
});
Proponentes.belongsToMany(tipo_categoria_iniciativas_1.default, {
    through: ProponentesTipoCategoriaDetalle_1.default,
    as: "tipos",
    foreignKey: "proponente_id",
});
tipo_categoria_iniciativas_1.default.belongsToMany(Proponentes, {
    through: ProponentesTipoCategoriaDetalle_1.default,
    as: "proponentes",
    foreignKey: "tipo_categoria_id",
});
exports.default = Proponentes;
