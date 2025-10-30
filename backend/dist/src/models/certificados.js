"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const users_1 = __importDefault(require("./users"));
class Certificado extends sequelize_1.Model {
}
Certificado.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    id_diputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    rfc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    vigencia_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false
    },
    vigencia_fin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false
    },
    path_firma_autografa: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    path_doc_validacion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    path_certificado: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    id_usuario_registro: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    hash_certificado: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    fecha_revocacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'certificados',
    timestamps: true,
});
// 👇 Asociaciones
Certificado.belongsTo(datos_users_1.default, { foreignKey: 'id_diputado', as: 'diputado' });
Certificado.belongsTo(users_1.default, { foreignKey: 'id_usuario_registro', as: 'usuario_registro' });
exports.default = Certificado;
