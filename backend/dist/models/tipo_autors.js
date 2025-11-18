"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class TipoAutor extends sequelize_1.Model {
}
TipoAutor.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    model: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        field: 'deleted_at',
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'tipo_autors',
    timestamps: true,
    paranoid: true,
});
exports.default = TipoAutor;
