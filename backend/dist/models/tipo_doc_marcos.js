"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipo_doc_marcos = void 0;
const sequelize_1 = require("sequelize");
class tipo_doc_marcos extends sequelize_1.Model {
    static initModel(sequelize) {
        return tipo_doc_marcos.init({
            uuid: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false
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
            tableName: 'tipo_doc_marcos',
            timestamps: true
        });
    }
}
exports.tipo_doc_marcos = tipo_doc_marcos;
