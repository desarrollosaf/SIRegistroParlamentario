"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_presentas = void 0;
const sequelize_1 = require("sequelize");
class tipo_presentas extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_presentas.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            tipo: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            status: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 1
            }
        }, {
            sequelize,
            tableName: 'tipo_presentas',
            timestamps: true,
            paranoid: true,
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
exports.tipo_presentas = tipo_presentas;
