"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const leyes_informes_1 = __importDefault(require("./leyes_informes"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
class Informes extends sequelize_1.Model {
}
// Inicialización
Informes.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    integrante_legislatura_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    foto_principal: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    foto_ficha: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    foto_descarga: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    liga: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fecha_inter: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    header_dip: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'informes',
    timestamps: true,
    paranoid: true,
    underscored: true,
});
// Asociaciones
Informes.hasMany(leyes_informes_1.default, { foreignKey: 'informes_id', as: 'leyes_informes' });
Informes.belongsTo(integrante_legislaturas_1.default, { foreignKey: 'integrante_legislatura_id', as: 'integrante_legislatura' });
exports.default = Informes;
