"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const comunicados_1 = __importDefault(require("./comunicados"));
class DescripcionComunicado extends sequelize_1.Model {
}
DescripcionComunicado.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    bullets: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    comunicado_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'comunicados',
            key: 'id',
        },
    },
    orden: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
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
    sequelize: legislativoConnection_1.default,
    tableName: 'descripcione_comunicados',
    timestamps: true,
    paranoid: true,
    underscored: true, // created_at, updated_at, deleted_at
});
// 👇 Asociación
DescripcionComunicado.belongsTo(comunicados_1.default, {
    foreignKey: 'comunicado_id',
    as: 'comunicado',
});
exports.default = DescripcionComunicado;
