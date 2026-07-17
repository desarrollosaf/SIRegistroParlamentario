"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
// Composiciones del "Proyector rápido" guardadas para proyectar después.
class ProyeccionGuardada extends sequelize_1.Model {
}
ProyeccionGuardada.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    comision_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: true,
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tipo: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    contenido: {
        type: sequelize_1.DataTypes.JSON,
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
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'proyeccion_guardadas',
    timestamps: true,
});
exports.default = ProyeccionGuardada;
