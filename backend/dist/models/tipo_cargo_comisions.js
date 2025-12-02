"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const registrocomisiones_1 = __importDefault(require("../database/registrocomisiones"));
class TipoCargoComision extends sequelize_1.Model {
}
TipoCargoComision.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    valor: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    nivel: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: "created_at"
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: "updated_at"
    }
}, {
    sequelize: registrocomisiones_1.default,
    tableName: "tipo_cargo_comisions",
    timestamps: true,
    paranoid: false,
    underscored: true // usa snake_case
});
// 🔗 Asociación
// TipoCargoComision.hasMany(IntegranteComision, {
//   foreignKey: "id_tipo_cargo",
//   as: "integrante_comisions"
// });
exports.default = TipoCargoComision;
