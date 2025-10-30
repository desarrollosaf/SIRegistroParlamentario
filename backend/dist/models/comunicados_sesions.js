"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const comunicados_1 = __importDefault(require("./comunicados"));
const sesiones_1 = __importDefault(require("./sesiones"));
class ComunicadosSesion extends sequelize_1.Model {
}
ComunicadosSesion.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_sesion: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'sesiones',
            key: 'id',
        },
    },
    comunicado_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'comunicados',
            key: 'id',
        },
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
    tableName: 'comunicados_sesions',
    timestamps: true,
    underscored: true, // 👈 nombres tipo snake_case
});
// 🔗 Asociaciones
ComunicadosSesion.belongsTo(comunicados_1.default, {
    foreignKey: 'comunicado_id',
    as: 'comunicado',
});
ComunicadosSesion.belongsTo(sesiones_1.default, {
    foreignKey: 'id_sesion',
    as: 'sesion',
});
exports.default = ComunicadosSesion;
