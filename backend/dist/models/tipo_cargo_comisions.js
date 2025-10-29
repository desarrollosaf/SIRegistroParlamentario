"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_cargo_comisions = void 0;
const sequelize_1 = require("sequelize");
class tipo_cargo_comisions extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_cargo_comisions.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            valor: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            nivel: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            created_at: sequelize_1.DataTypes.DATE,
            updated_at: sequelize_1.DataTypes.DATE
        }, {
            sequelize,
            tableName: 'tipo_cargo_comisions',
            timestamps: true,
            paranoid: false,
            underscored: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: ['id']
                }
            ]
        });
    }
}
exports.tipo_cargo_comisions = tipo_cargo_comisions;
