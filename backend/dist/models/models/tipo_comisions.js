"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class TipoComisions extends sequelize_1.Model {
}
TipoComisions.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'tipo_comisions',
    timestamps: true,
});
exports.default = TipoComisions;
