"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnos = void 0;
const sequelize_1 = require("sequelize");
class turnos extends sequelize_1.Model {
    static initModel(sequelize) {
        return turnos.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            id_documento: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                references: {
                    model: 'documentos',
                    key: 'id'
                }
            },
            id_diputado: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                references: {
                    model: 'datos_users',
                    key: 'id'
                }
            },
            firmado: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            nivel: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            fecha_firma: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'turnos',
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
                {
                    name: "turnos_id_documento_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_documento" },
                    ]
                },
                {
                    name: "turnos_id_diputado_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_diputado" },
                    ]
                },
            ]
        });
    }
}
exports.turnos = turnos;
