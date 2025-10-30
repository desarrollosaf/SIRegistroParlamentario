"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class AdminCat extends sequelize_1.Model {
}
AdminCat.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    id_presenta: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    secretaria: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    titular: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    periodo_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true
    },
    periodo_fin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'admin_cats',
    timestamps: true,
});
// 👇 Asociaciones
// AdminCat.belongsTo(OtroModelo, { foreignKey: 'id_presenta', as: 'Presenta' });
exports.default = AdminCat;
