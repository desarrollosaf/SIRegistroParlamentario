"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const comunicados_1 = __importDefault(require("./comunicados"));
class AutorComunicado extends sequelize_1.Model {
}
AutorComunicado.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    comunicado_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    tipo_autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'autores_comunicados',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
AutorComunicado.belongsTo(comunicados_1.default, { foreignKey: 'comunicado_id', as: 'comunicado' });
exports.default = AutorComunicado;
