"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
const inciativas_puntos_ordens_1 = __importDefault(require("./inciativas_puntos_ordens"));
class Decreto extends sequelize_1.Model {
}
Decreto.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    num_decreto: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fecha_decreto: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    nombre_decreto: {
        type: sequelize_1.DataTypes.TEXT("long"),
        allowNull: true,
    },
    decreto: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    id_iniciativa: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    congreso: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "decretos",
    timestamps: true,
    paranoid: true,
});
Decreto.belongsTo(inciativas_puntos_ordens_1.default, {
    foreignKey: "id_iniciativa",
    as: "iniciativa",
});
inciativas_puntos_ordens_1.default.hasMany(Decreto, {
    foreignKey: "id_iniciativa",
    as: "decretos",
});
exports.default = Decreto;
