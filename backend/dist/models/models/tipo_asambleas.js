"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_asambleas = void 0;
const sequelize_1 = require("sequelize");
class tipo_asambleas extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_asambleas.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            valor: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            created_at: sequelize_1.DataTypes.DATE,
            updated_at: sequelize_1.DataTypes.DATE,
            deleted_at: sequelize_1.DataTypes.DATE
        }, {
            sequelize,
            tableName: 'tipo_asambleas',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: ['id']
                }
            ]
        });
    }
}
exports.tipo_asambleas = tipo_asambleas;
