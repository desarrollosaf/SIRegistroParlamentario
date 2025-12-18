"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const puntos_presenta_1 = __importDefault(require("./puntos_presenta"));
const agendas_1 = __importDefault(require("./agendas"));
const temas_puntos_votos_1 = __importDefault(require("./temas_puntos_votos"));
const puntos_comisiones_1 = __importDefault(require("./puntos_comisiones"));
class PuntosOrden extends sequelize_1.Model {
}
PuntosOrden.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_evento: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    nopunto: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    punto: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: false,
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    path_doc: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    tribuna: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_tipo: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    punto_turno_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    id_proponente: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    dispensa: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    editado: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    se_turna_comision: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    },
    id_dictamen: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "puntos_ordens",
    timestamps: true,
    paranoid: true,
    underscored: false,
});
PuntosOrden.hasMany(puntos_presenta_1.default, {
    foreignKey: 'id_punto', as: 'presentan'
});
PuntosOrden.belongsTo(agendas_1.default, { foreignKey: 'id_evento', as: 'evento' });
PuntosOrden.hasMany(puntos_comisiones_1.default, {
    foreignKey: 'id_punto_turno', as: 'puntoTurnoComision'
});
PuntosOrden.hasMany(puntos_comisiones_1.default, {
    foreignKey: 'id_punto', as: 'turnocomision'
});
PuntosOrden.hasMany(temas_puntos_votos_1.default, {
    foreignKey: 'id_punto',
    as: 'temasVotos',
});
exports.default = PuntosOrden;
