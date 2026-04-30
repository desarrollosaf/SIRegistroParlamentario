"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const autores_comunicados_1 = __importDefault(require("./autores_comunicados"));
const comunicados_sesions_1 = __importDefault(require("./comunicados_sesions"));
const descripcione_comunicados_1 = __importDefault(require("./descripcione_comunicados"));
class Comunicado extends sequelize_1.Model {
}
Comunicado.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    fecha: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    comunicado: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    titulo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    texto: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    publicado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
    },
    fecha_publicacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    sesion: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    tableName: 'comunicados',
    timestamps: true,
    paranoid: true,
    underscored: true, // columnas tipo snake_case
});
// 🔗 Asociaciones
Comunicado.hasMany(autores_comunicados_1.default, {
    foreignKey: 'comunicado_id',
    as: 'autores',
});
Comunicado.hasMany(comunicados_sesions_1.default, {
    foreignKey: 'comunicado_id',
    as: 'sesiones',
});
Comunicado.hasMany(descripcione_comunicados_1.default, {
    foreignKey: 'comunicado_id',
    as: 'descripciones',
});
exports.default = Comunicado;
