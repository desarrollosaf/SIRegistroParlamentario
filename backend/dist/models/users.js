"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const sequelize_1 = require("sequelize");
class users extends sequelize_1.Model {
    static initModel(sequelize) {
        return users.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            email: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                unique: "users_email_unique"
            },
            email_verified_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            password: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            permisoAcceso: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            permisoAccesoTodos: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 1
            },
            pass: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            remember_token: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'users',
            timestamps: true,
            paranoid: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                },
                {
                    name: "users_email_unique",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "email" },
                    ]
                },
            ]
        });
    }
}
exports.users = users;
