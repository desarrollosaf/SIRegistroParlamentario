"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validacions = void 0;
const sequelize_1 = require("sequelize");
class validacions extends sequelize_1.Model {
    static initModel(sequelize) {
        return validacions.init({
            id: {
                autoIncrement: true,
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            validacion: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'validacions',
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
exports.validacions = validacions;
