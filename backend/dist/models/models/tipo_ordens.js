"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_ordens = void 0;
const sequelize_1 = require("sequelize");
class tipo_ordens extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_ordens.init({
            id: {
                autoIncrement: true,
                type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            tipo: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'tipo_ordens',
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
exports.tipo_ordens = tipo_ordens;
