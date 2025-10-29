"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudFirmas = void 0;
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class SolicitudFirmas extends sequelize_1.Model {
}
exports.SolicitudFirmas = SolicitudFirmas;
SolicitudFirmas.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    idDiputado: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    fechaSolicitud: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fechaAtencion: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'solicitud_firmas',
    timestamps: true,
    paranoid: false,
    indexes: [
        { name: 'PRIMARY', unique: true, using: 'BTREE', fields: ['id'] },
        { name: 'solicitud_firmas_id_diputado_foreign', using: 'BTREE', fields: ['idDiputado'] },
    ],
});
exports.default = SolicitudFirmas;
