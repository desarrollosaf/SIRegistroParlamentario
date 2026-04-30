"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model_has_permissions = void 0;
const sequelize_1 = require("sequelize");
class model_has_permissions extends sequelize_1.Model {
    static initModel(sequelize) {
        return model_has_permissions.init({
            permission_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'permissions',
                    key: 'id'
                }
            },
            model_type: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true
            },
            model_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            }
        }, {
            sequelize,
            tableName: 'model_has_permissions',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "permission_id" },
                        { name: "model_id" },
                        { name: "model_type" },
                    ]
                },
                {
                    name: "model_has_permissions_model_id_model_type_index",
                    using: "BTREE",
                    fields: [
                        { name: "model_id" },
                        { name: "model_type" },
                    ]
                },
            ]
        });
    }
}
exports.model_has_permissions = model_has_permissions;
