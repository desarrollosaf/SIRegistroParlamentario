"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_eventos = void 0;
const sequelize_1 = require("sequelize");
class tipo_eventos extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_eventos.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'tipo_eventos',
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
exports.tipo_eventos = tipo_eventos;
