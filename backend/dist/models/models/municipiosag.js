"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MunicipiosAg = void 0;
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class MunicipiosAg extends sequelize_1.Model {
}
exports.MunicipiosAg = MunicipiosAg;
MunicipiosAg.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "createdAt",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "updatedAt",
    },
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "Municipios",
    modelName: "MunicipiosAg",
    timestamps: true,
});
exports.default = MunicipiosAg;
