"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role_has_permissions = void 0;
const sequelize_1 = require("sequelize");
class role_has_permissions extends sequelize_1.Model {
    static initModel(sequelize) {
        return role_has_permissions.init({
            permission_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'permissions',
                    key: 'id'
                }
            },
            role_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'roles',
                    key: 'id'
                }
            }
        }, {
            sequelize,
            tableName: 'role_has_permissions',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "permission_id" },
                        { name: "role_id" },
                    ]
                },
                {
                    name: "role_has_permissions_role_id_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "role_id" },
                    ]
                },
            ]
        });
    }
}
exports.role_has_permissions = role_has_permissions;
