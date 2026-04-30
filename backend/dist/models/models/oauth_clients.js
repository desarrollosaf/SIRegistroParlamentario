"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth_clients = void 0;
const sequelize_1 = require("sequelize");
class oauth_clients extends sequelize_1.Model {
    static initModel(sequelize) {
        return oauth_clients.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            secret: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            provider: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            },
            redirect: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            personal_access_client: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false
            },
            password_client: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false
            },
            revoked: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'oauth_clients',
            timestamps: true,
            indexes: [
                {
                    name: "oauth_clients_user_id_index",
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                    ]
                },
            ]
        });
    }
}
exports.oauth_clients = oauth_clients;
