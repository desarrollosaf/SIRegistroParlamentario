"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
class Banner extends sequelize_1.Model {
}
Banner.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    orden: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'banners',
    timestamps: true,
    paranoid: true,
});
exports.default = Banner;
