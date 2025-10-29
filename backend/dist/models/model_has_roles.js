"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model_has_roles = void 0;
const sequelize_1 = require("sequelize");
class model_has_roles extends sequelize_1.Model {
    static initModel(sequelize) {
        return model_has_roles.init({
            role_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'roles',
                    key: 'id'
                }
            },
            model_type: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true
            },
            model_id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            }
        }, {
            sequelize,
            tableName: 'model_has_roles',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "role_id" },
                        { name: "model_id" },
                        { name: "model_type" },
                    ]
                },
                {
                    name: "model_has_roles_model_id_model_type_index",
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
exports.model_has_roles = model_has_roles;
