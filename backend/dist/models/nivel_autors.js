"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const autor_iniciativas_1 = __importDefault(require("./autor_iniciativas"));
class NivelAutors extends sequelize_1.Model {
}
// Inicialización
NivelAutors.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'nivel_autors',
    timestamps: true,
});
// Asociaciones
NivelAutors.hasMany(autor_iniciativas_1.default, { foreignKey: 'nivel_autor_id', as: 'autor_iniciativas' });
exports.default = NivelAutors;
