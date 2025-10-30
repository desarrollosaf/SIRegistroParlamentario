"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const generos_1 = __importDefault(require("./generos"));
const users_1 = __importDefault(require("./users"));
class DatosUser extends sequelize_1.Model {
}
DatosUser.init({
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
    intentos: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bloqueo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    tipo_diputado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    rfc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    shortname: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    ext: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    facebook: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    twitter: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    instagram: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    link_web: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    ubicacion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    generoId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        field: 'genero_id',
        references: {
            model: generos_1.default,
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    userId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        field: 'user_id',
        references: {
            model: users_1.default,
            key: 'id',
        },
    },
    cel: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    path_foto: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'deleted_at',
    },
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'datos_users',
    timestamps: true,
    paranoid: true,
    underscored: true,
});
// 🔗 Relacion
