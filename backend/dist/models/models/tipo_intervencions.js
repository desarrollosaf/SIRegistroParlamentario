"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class TipoIntervencion extends sequelize_1.Model {
}
TipoIntervencion.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: "updated_at",
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: "deleted_at",
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "tipo_intervencions",
    timestamps: true,
    paranoid: true,
    underscored: true,
});
exports.default = TipoIntervencion;
