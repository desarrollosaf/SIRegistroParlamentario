"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const diputado_1 = __importDefault(require("./diputado"));
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
    diputado_id: {
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
    fecha_ingreso: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        field: 'updated_at',
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        field: 'deleted_at',
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'integrante_legislaturas',
    timestamps: true,
    paranoid: true, // soft deletes
});
// Asociaciones
IntegranteLegislatura.belongsTo(diputado_1.default, {
    foreignKey: 'diputado_id',
    as: 'diputado',
});
// IntegranteLegislatura.belongsTo(DatosUser, {
//   foreignKey: 'dato_dipoficial_id',
//   as: 'dato_dipoficial',
// });
// IntegranteLegislatura.belongsTo(Distrito, {
//   foreignKey: 'distrito_id',
//   as: 'distrito',
// });
// IntegranteLegislatura.belongsTo(Legislatura, {
//   foreignKey: 'legislatura_id',
//   as: 'legislatura',
// });
// IntegranteLegislatura.belongsTo(Partido, {
//   foreignKey: 'partido_id',
//   as: 'partido',
// });
// IntegranteLegislatura.hasMany(Informe, {
//   foreignKey: 'integrante_legislatura_id',
//   as: 'informes',
// });
// IntegranteLegislatura.hasMany(IntegranteComision, {
//   foreignKey: 'integrante_legislatura_id',
//   as: 'integrante_comisions',
// });
exports.default = IntegranteLegislatura;
