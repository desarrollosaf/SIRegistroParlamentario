"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const informes_1 = __importDefault(require("./informes"));
class LeyesInforme extends sequelize_1.Model {
}
// Inicialización del modelo
LeyesInforme.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    bullets: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    informes_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    orden: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'leyes_informes',
    timestamps: true,
    paranoid: true,
});
// Asociación
LeyesInforme.belongsTo(informes_1.default, {
    foreignKey: 'informes_id',
    as: 'informe',
});
exports.default = LeyesInforme;
