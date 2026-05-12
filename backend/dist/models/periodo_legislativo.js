"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
/*
  SQL para crear la tabla en la base de datos registrocomisiones:

  CREATE TABLE periodos_legislativos (
    id        CHAR(36)     NOT NULL PRIMARY KEY,
    nombre    VARCHAR(255) NOT NULL,
    anio_legislativo VARCHAR(100) NULL,
    fecha_inicio  DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    tipo      INT NOT NULL DEFAULT 1, -- 1=ordinario, 2=extraordinario
    createdAt DATETIME NULL,
    updatedAt DATETIME NULL,
    deletedAt DATETIME NULL
  );
*/
class PeriodoLegislativo extends sequelize_1.Model {
}
PeriodoLegislativo.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    anio_legislativo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_termino: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    tipo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'periodos_legislativos',
    timestamps: true,
    paranoid: true,
});
exports.default = PeriodoLegislativo;
