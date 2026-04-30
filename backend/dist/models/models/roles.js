"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles = void 0;
const sequelize_1 = require("sequelize");
class roles extends sequelize_1.Model {
    static initModel(sequelize) {
        return roles.init({
            id: {
                autoIncrement: true,
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            guard_name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'roles',
            timestamps: true,
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
                    name: "roles_name_guard_name_unique",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "name" },
                        { name: "guard_name" },
                    ]
                },
            ]
        });
    }
}
exports.roles = roles;
