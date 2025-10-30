"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
class FailedJobs extends sequelize_1.Model {
}
FailedJobs.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    connection: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    queue: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    payload: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    exception: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    failedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'failed_at',
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'failed_jobs',
    timestamps: false,
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
exports.default = FailedJobs;
