"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
// import Gender from './gender';
class Diputado extends sequelize_1.Model {
}
Diputado.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    apaterno: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    amaterno: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    nombres: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    shortname: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    fancyurl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    gender_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    ext: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    facebook: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    twitter: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    instagram: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    ubicacion: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false,
    },
    link_web: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    telefono: {
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
    sequelize: legislativoConnection_1.default,
    tableName: 'diputados',
    timestamps: true,
    paranoid: true,
});
// 🔗 Asociación (si existe modelo Gender)
// Diputado.belongsTo(Gender, {
//   foreignKey: 'gender_id',
//   as: 'gender',
// });
exports.default = Diputado;
