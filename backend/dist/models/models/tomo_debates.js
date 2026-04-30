"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tomo_debates = void 0;
const sequelize_1 = require("sequelize");
class tomo_debates extends sequelize_1.Model {
    static initModel(sequelize) {
        return tomo_debates.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            tomo: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'tomo_debates',
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
            ]
        });
    }
}
exports.tomo_debates = tomo_debates;
