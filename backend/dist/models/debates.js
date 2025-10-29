"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const tomo_debates_1 = __importDefault(require("./tomo_debates"));
class Debate extends sequelize_1.Model {
}
Debate.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    fecha_debate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    id_tomo: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: tomo_debates_1.default,
            key: 'id',
        },
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
    sequelize: parlamentariosConnection_1.default,
    tableName: 'debates',
    timestamps: true,
    underscored: true,
});
// 🔗 Asociación
Debate.belongsTo(tomo_debates_1.default, {
    foreignKey: 'id_tomo',
    as: 'tomo',
});
exports.default = Debate;
