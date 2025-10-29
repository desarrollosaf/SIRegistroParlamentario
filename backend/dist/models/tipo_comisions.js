"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_comisions = void 0;
const sequelize_1 = require("sequelize");
class tipo_comisions extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_comisions.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            valor: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            alias: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'tipo_comisions',
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
exports.tipo_comisions = tipo_comisions;
