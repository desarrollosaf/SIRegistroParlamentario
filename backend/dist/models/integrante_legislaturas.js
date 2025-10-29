"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const datos_users_1 = __importDefault(require("./datos_users"));
const distritos_1 = __importDefault(require("./distritos"));
const informes_1 = __importDefault(require("./informes"));
const integrante_comisions_1 = __importDefault(require("./integrante_comisions"));
const legislaturas_1 = __importDefault(require("./legislaturas"));
const partidos_1 = __importDefault(require("./partidos"));
class IntegranteLegislatura extends sequelize_1.Model {
}
// Inicialización
IntegranteLegislatura.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    legislatura_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    dato_user_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    partido_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    distrito_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    cargo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    nivel: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    fecha_ingreso: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    dato_dipoficial_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'integrante_legislaturas',
    timestamps: true,
    paranoid: true, // soft deletes
});
// Asociaciones
IntegranteLegislatura.belongsTo(datos_users_1.default, {
    foreignKey: 'dato_user_id',
    as: 'dato_user',
});
IntegranteLegislatura.belongsTo(datos_users_1.default, {
    foreignKey: 'dato_dipoficial_id',
    as: 'dato_dipoficial',
});
IntegranteLegislatura.belongsTo(distritos_1.default, {
    foreignKey: 'distrito_id',
    as: 'distrito',
});
IntegranteLegislatura.belongsTo(legislaturas_1.default, {
    foreignKey: 'legislatura_id',
    as: 'legislatura',
});
IntegranteLegislatura.belongsTo(partidos_1.default, {
    foreignKey: 'partido_id',
    as: 'partido',
});
IntegranteLegislatura.hasMany(informes_1.default, {
    foreignKey: 'integrante_legislatura_id',
    as: 'informes',
});
IntegranteLegislatura.hasMany(integrante_comisions_1.default, {
    foreignKey: 'integrante_legislatura_id',
    as: 'integrante_comisions',
});
exports.default = IntegranteLegislatura;
