"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
// import TipoCargoComision from './tipo_cargo_comisions';
class IntegranteComision extends sequelize_1.Model {
}
// Inicialización
IntegranteComision.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    integrante_legislatura_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    tipo_cargo_comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
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
    tableName: 'integrante_comisions',
    timestamps: true,
    paranoid: true,
});
// IntegranteComision.belongsTo(Comision, {
//   foreignKey: 'comision_id',
//   as: 'comision',
// });
IntegranteComision.belongsTo(integrante_legislaturas_1.default, {
    foreignKey: 'integrante_legislatura_id',
    as: 'integranteLegislatura',
});
// IntegranteComision.belongsTo(TipoCargoComision, {
//   foreignKey: 'tipo_cargo_comision_id',
//   as: 'tipo_cargo_comision',
// });
exports.default = IntegranteComision;
