"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.password_resets = void 0;
const sequelize_1 = require("sequelize");
class password_resets extends sequelize_1.Model {
    static initModel(sequelize) {
        return password_resets.init({
            email: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            token: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'password_resets',
            timestamps: true,
            indexes: [
                {
                    name: "password_resets_email_index",
                    using: "BTREE",
                    fields: [
                        { name: "email" },
                    ]
                },
            ]
        });
    }
}
exports.password_resets = password_resets;
