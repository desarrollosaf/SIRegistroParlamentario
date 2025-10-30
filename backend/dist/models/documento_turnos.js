"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const documentos_1 = __importDefault(require("./documentos"));
class DocumentoTurnos extends sequelize_1.Model {
}
DocumentoTurnos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    documento_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'documentos',
            key: 'id',
        },
    },
    tipo_turno: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    turno_firmante: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    id_comision_partido: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    texto: {
        type: sequelize_1.DataTypes.TEXT,
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
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'documento_turnos',
    timestamps: true,
    underscored: true,
});
// Relación belongsTo
DocumentoTurnos.belongsTo(documentos_1.default, {
    foreignKey: 'documento_id',
    as: 'documento',
});
exports.default = DocumentoTurnos;
