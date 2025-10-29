"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turno_comisions = void 0;
const sequelize_1 = require("sequelize");
class turno_comisions extends sequelize_1.Model {
    static initModel(sequelize) {
        return turno_comisions.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            id_comision: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true,
                references: {
                    model: 'comisions',
                    key: 'id'
                }
            },
            id_punto_orden: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true,
                references: {
                    model: 'puntos_ordens',
                    key: 'id'
                }
            },
            id_agenda: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true,
                references: {
                    model: 'agendas',
                    key: 'id'
                }
            },
            status: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 1
            },
            id_sesion_regreso: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'turno_comisions',
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
                    name: "turno_comisions_id_comision_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_comision" },
                    ]
                },
                {
                    name: "turno_comisions_id_punto_orden_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_punto_orden" },
                    ]
                },
                {
                    name: "turno_comisions_id_agenda_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_agenda" },
                    ]
                },
            ]
        });
    }
}
exports.turno_comisions = turno_comisions;
