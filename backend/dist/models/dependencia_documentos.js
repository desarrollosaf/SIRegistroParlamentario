"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const marco_j_s_1 = __importDefault(require("./marco_j_s"));
class DependenciaDocumento extends sequelize_1.Model {
}
DependenciaDocumento.init({
    id: {
        autoIncrement: true,
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
    },
    id_marcoj: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'marco_j_s',
            key: 'id',
        },
    },
    id_Dependencia: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    tableName: 'dependencia_documentos',
    timestamps: true,
    underscored: true, // para usar created_at y updated_at
});
// 👇 Asociación
DependenciaDocumento.belongsTo(marco_j_s_1.default, {
    foreignKey: 'id_marcoj',
    as: 'marco_j',
});
exports.default = DependenciaDocumento;
