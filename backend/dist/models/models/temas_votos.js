"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.temas_votos = void 0;
const sequelize_1 = require("sequelize");
class temas_votos extends sequelize_1.Model {
    static initModel(sequelize) {
        return temas_votos.init({
            id: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                primaryKey: true
            },
            id_punto: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: true,
                references: {
                    model: 'puntos_ordens',
                    key: 'id'
                }
            },
            id_evento: {
                type: sequelize_1.DataTypes.CHAR(36),
                allowNull: false,
                references: {
                    model: 'sesiones',
                    key: 'id'
                }
            },
            votacion: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true
            },
            status: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false
            },
            fechaVotacion: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false
            },
            totalVotos: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            id_decision: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            tiempoVotacion: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            },
            tiempoVotacionInicio: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'temas_votos',
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
                    name: "temas_votos_id_punto_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_punto" },
                    ]
                },
                {
                    name: "temas_votos_id_evento_foreign",
                    using: "BTREE",
                    fields: [
                        { name: "id_evento" },
                    ]
                },
            ]
        });
    }
}
exports.temas_votos = temas_votos;
