"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const role_1 = __importDefault(require("./role"));
class RolUsers extends sequelize_1.Model {
}
RolUsers.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'rol_users',
    timestamps: true,
    indexes: [
        {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id' }],
        },
    ],
});
exports.default = RolUsers;
RolUsers.belongsTo(role_1.default, { foreignKey: 'role_id', as: 'role' });
role_1.default.hasMany(RolUsers, { foreignKey: 'role_id', as: 'rol_users' });
