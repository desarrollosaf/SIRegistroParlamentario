"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth_personal_access_clients = void 0;
const sequelize_1 = require("sequelize");
class oauth_personal_access_clients extends sequelize_1.Model {
    static initModel(sequelize) {
        return oauth_personal_access_clients.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            client_id: {
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'oauth_personal_access_clients',
            timestamps: true
        });
    }
}
exports.oauth_personal_access_clients = oauth_personal_access_clients;
