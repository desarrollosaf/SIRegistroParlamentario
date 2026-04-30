"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth_refresh_tokens = void 0;
const sequelize_1 = require("sequelize");
class oauth_refresh_tokens extends sequelize_1.Model {
    static initModel(sequelize) {
        return oauth_refresh_tokens.init({
            id: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true
            },
            access_token_id: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            revoked: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false
            },
            expires_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'oauth_refresh_tokens',
            timestamps: false,
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
                    name: "oauth_refresh_tokens_access_token_id_index",
                    using: "BTREE",
                    fields: [
                        { name: "access_token_id" },
                    ]
                },
            ]
        });
    }
}
exports.oauth_refresh_tokens = oauth_refresh_tokens;
