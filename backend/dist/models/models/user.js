"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const role_users_1 = __importDefault(require("./role_users"));
// import { dp_fum_datos_generales } from './fun/dp_fum_datos_generales';
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Sequelize genera el UUID
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    email_verified_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    remember_token: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'users',
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
// Relaciones
User.hasOne(role_users_1.default, { foreignKey: 'user_id', as: 'rol_users' });
role_users_1.default.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// User.hasOne(dp_fum_datos_generales, { foreignKey: 'user_id', as: 'rol_users' });
// User.hasOne(dp_datospersonales, {
//   sourceKey: 'name',         
//   foreignKey: 'f_curp',   
//   as: 'datos_user',
// });
exports.default = User;
