"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const tipo_categoria_iniciativas_1 = __importDefault(require("./tipo_categoria_iniciativas"));
const users_1 = __importDefault(require("./users"));
class DocumentoFirmas extends sequelize_1.Model {
}
DocumentoFirmas.init({
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
        references: {
            model: 'tipo_categoria_iniciativas',
            key: 'id',
        },
    },
    path_doc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    id_usuario_registro: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
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
    sequelize: legislativoConnection_1.default,
    tableName: 'documento_firmas',
    timestamps: true,
    underscored: true,
});
// Relaciones
DocumentoFirmas.belongsTo(tipo_categoria_iniciativas_1.default, {
    foreignKey: 'id_tipo_doc',
    as: 'tipo_categoria_iniciativa',
});
DocumentoFirmas.belongsTo(users_1.default, {
    foreignKey: 'id_usuario_registro',
    as: 'usuario_registro',
});
exports.default = DocumentoFirmas;
