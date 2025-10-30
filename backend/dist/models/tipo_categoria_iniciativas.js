"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_categoria_iniciativas = void 0;
const sequelize_1 = require("sequelize");
class tipo_categoria_iniciativas extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_categoria_iniciativas.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            valor: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'tipo_categoria_iniciativas',
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
exports.tipo_categoria_iniciativas = tipo_categoria_iniciativas;
