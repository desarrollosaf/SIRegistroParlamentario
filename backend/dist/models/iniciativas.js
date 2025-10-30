"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
const autor_iniciativas_1 = __importDefault(require("./autor_iniciativas"));
const decreto_iniciativas_1 = __importDefault(require("./decreto_iniciativas"));
class Iniciativas extends sequelize_1.Model {
}
// Inicialización
Iniciativas.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    folio: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
    },
    categoria_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
    },
    iniciativa: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    fecha_presentacion: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_expedicion: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'iniciativas',
    timestamps: true,
});
// Asociaciones
Iniciativas.hasMany(autor_iniciativas_1.default, { foreignKey: 'iniciativa_id', as: 'autor_iniciativas' });
Iniciativas.hasMany(decreto_iniciativas_1.default, { foreignKey: 'iniciativa_id', as: 'decreto_iniciativas' });
exports.default = Iniciativas;
