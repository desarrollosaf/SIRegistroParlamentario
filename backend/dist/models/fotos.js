"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class Fotos extends sequelize_1.Model {
}
Fotos.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    path: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    fotoableId: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        field: 'fotoable_id',
    },
    fotoableType: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: 'fotoable_type',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'fotos',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id' }],
        },
    ],
});
exports.default = Fotos;
