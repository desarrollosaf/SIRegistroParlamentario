"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pleno_1 = __importDefault(require("../database/pleno"));
const agendas_1 = __importDefault(require("./agendas"));
const comisions_1 = __importDefault(require("./comisions"));
const puntos_ordens_1 = __importDefault(require("./puntos_ordens"));
class TurnoComisions extends sequelize_1.Model {
}
// Inicialización
TurnoComisions.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    id_comision: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: { model: 'comisions', key: 'id' },
    },
    id_punto_orden: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: { model: 'puntos_ordens', key: 'id' },
    },
    id_agenda: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: { model: 'agendas', key: 'id' },
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },
    id_sesion_regreso: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: pleno_1.default,
    tableName: 'turno_comisions',
    timestamps: true,
    paranoid: true,
});
// Asociaciones
TurnoComisions.belongsTo(agendas_1.default, { foreignKey: 'id_agenda', as: 'id_agenda_agenda' });
TurnoComisions.belongsTo(comisions_1.default, { foreignKey: 'id_comision', as: 'id_comision_comision' });
TurnoComisions.belongsTo(puntos_ordens_1.default, { foreignKey: 'id_punto_orden', as: 'id_punto_orden_puntos_orden' });
exports.default = TurnoComisions;
