"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatFunDep = void 0;
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class CatFunDep extends sequelize_1.Model {
}
exports.CatFunDep = CatFunDep;
CatFunDep.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    nombre_dependencia: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    nombre_titular: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    vigente: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'createdAt'
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'updatedAt'
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: 'cat_fun_dep',
    timestamps: true
});
exports.default = CatFunDep;
