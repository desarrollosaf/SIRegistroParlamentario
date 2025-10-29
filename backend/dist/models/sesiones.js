"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sesiones = void 0;
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class Sesiones extends sequelize_1.Model {
}
exports.Sesiones = Sesiones;
Sesiones.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    agendaId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'agendas',
            key: 'id',
        },
    },
    sesion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tipoSesionId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'tipo_sesions',
            key: 'id',
        },
    },
    regimenId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'regimen_sesions',
            key: 'id',
        },
    },
    anioId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'anio_sesions',
            key: 'id',
        },
    },
    periodoId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'periodo_sesions',
            key: 'id',
        },
    },
    tipoAsambleaId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'tipo_asambleas',
            key: 'id',
        },
    },
    pathActa: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    pathOrden: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    pathEstenografia: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    estatus: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    },
    usuarioRegistroId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    usuarioCierraId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'datos_users',
            key: 'id',
        },
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'sesiones',
    timestamps: true,
    paranoid: true,
    indexes: [
        { name: 'PRIMARY', unique: true, using: 'BTREE', fields: ['id'] },
        { name: 'sesiones_agenda_id_foreign', using: 'BTREE', fields: ['agendaId'] },
        { name: 'sesiones_tipo_sesion_id_foreign', using: 'BTREE', fields: ['tipoSesionId'] },
        { name: 'sesiones_regimen_id_foreign', using: 'BTREE', fields: ['regimenId'] },
        { name: 'sesiones_anio_id_foreign', using: 'BTREE', fields: ['anioId'] },
        { name: 'sesiones_periodo_id_foreign', using: 'BTREE', fields: ['periodoId'] },
        { name: 'sesiones_usuario_registro_id_foreign', using: 'BTREE', fields: ['usuarioRegistroId'] },
        { name: 'sesiones_usuario_cierra_id_foreign', using: 'BTREE', fields: ['usuarioCierraId'] },
        { name: 'sesiones_tipo_asamblea_id_foreign', using: 'BTREE', fields: ['tipoAsambleaId'] },
    ],
});
exports.default = Sesiones;
