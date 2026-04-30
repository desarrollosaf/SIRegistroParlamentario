"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personal_access_tokens = void 0;
const sequelize_1 = require("sequelize");
class personal_access_tokens extends sequelize_1.Model {
    static initModel(sequelize) {
        return personal_access_tokens.init({
            id: {
                autoIncrement: true,
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            tokenable_type: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            tokenable_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },
            name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            token: {
                type: sequelize_1.DataTypes.STRING(64),
                allowNull: false,
                unique: "personal_access_tokens_token_unique"
            },
            abilities: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            last_used_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'personal_access_tokens',
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
                    name: "personal_access_tokens_token_unique",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "token" },
                    ]
                },
                {
                    name: "personal_access_tokens_tokenable_type_tokenable_id_index",
                    using: "BTREE",
                    fields: [
                        { name: "tokenable_type" },
                        { name: "tokenable_id" },
                    ]
                },
            ]
        });
    }
}
exports.personal_access_tokens = personal_access_tokens;
