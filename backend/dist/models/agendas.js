"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const anfitrion_agendas_1 = __importDefault(require("./anfitrion_agendas"));
const sedes_1 = __importDefault(require("./sedes"));
const sesion_agendas_1 = __importDefault(require("./sesion_agendas"));
const sesiones_1 = __importDefault(require("./sesiones"));
const tipo_eventos_1 = __importDefault(require("./tipo_eventos"));
const turno_comisions_1 = __importDefault(require("./turno_comisions"));
class Agenda extends sequelize_1.Model {
}
Agenda.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    hora: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true
    },
    fecha_hora: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    fecha_hora_inicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    fecha_hora_fin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    sede_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    tipo_evento_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true
    },
    transmision: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    estatus_transmision: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    inicio_programado: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    fin_programado: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    liga: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    documentacion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'agendas',
    timestamps: true,
    paranoid: true, // Para soft deletes (deletedAt)
});
// 👇 Asociaciones
Agenda.hasMany(anfitrion_agendas_1.default, { foreignKey: 'agenda_id', as: 'anfitrion_agendas' });
Agenda.hasMany(sesion_agendas_1.default, { foreignKey: 'agenda_id', as: 'sesion_agendas' });
Agenda.hasMany(sesiones_1.default, { foreignKey: 'agenda_id', as: 'sesiones' });
Agenda.hasMany(turno_comisions_1.default, { foreignKey: 'id_agenda', as: 'turno_comisions' });
Agenda.belongsTo(sedes_1.default, { foreignKey: 'sede_id', as: 'sede' });
Agenda.belongsTo(tipo_eventos_1.default, { foreignKey: 'tipo_evento_id', as: 'tipo_evento' });
exports.default = Agenda;
