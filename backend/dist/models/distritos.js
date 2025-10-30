"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const integrante_legislaturas_1 = __importDefault(require("./integrante_legislaturas"));
const municipios_1 = __importDefault(require("./municipios"));
class Distrito extends sequelize_1.Model {
}
Distrito.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    distrito: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    municipio_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
        references: {
            model: 'municipios',
            key: 'id',
        },
    },
    orden: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updated_at',
    },
}, {
    sequelize: legislativoConnection_1.default,
    tableName: 'distritos',
    timestamps: true,
    underscored: true,
});
// Asociación
Distrito.hasMany(integrante_legislaturas_1.default, {
    sourceKey: 'id',
    foreignKey: 'distrito_id',
    as: 'integrante_legislaturas',
});
Distrito.belongsTo(municipios_1.default, {
    foreignKey: 'municipio_id',
    as: 'municipio',
});
exports.default = Distrito;
