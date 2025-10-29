"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const documento_turnos_1 = __importDefault(require("./documento_turnos"));
const tipo_categoria_iniciativas_1 = __importDefault(require("./tipo_categoria_iniciativas"));
const turnos_1 = __importDefault(require("./turnos"));
class Documentos extends sequelize_1.Model {
}
Documentos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    nombreDoc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    id_tipo_doc: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'tipo_categoria_iniciativas', key: 'id' },
    },
    path_file: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    fojas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    id_usuario_registro: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'datos_users', key: 'id' },
    },
    tipo_turno: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tipo_flujo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tipo_orden: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tipoMesa: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    uuid: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    path_acuse: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
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
    sequelize: parlamentariosConnection_1.default,
    tableName: 'documentos',
    timestamps: true,
    underscored: true,
});
// Relaciones
Documentos.belongsTo(datos_users_1.default, { foreignKey: 'id_usuario_registro', as: 'usuario' });
Documentos.belongsTo(tipo_categoria_iniciativas_1.default, { foreignKey: 'id_tipo_doc', as: 'tipo_categoria' });
Documentos.hasMany(documento_turnos_1.default, { foreignKey: 'documento_id', as: 'documento_turnos' });
Documentos.hasMany(turnos_1.default, { foreignKey: 'id_documento', as: 'turnos' });
exports.default = Documentos;
