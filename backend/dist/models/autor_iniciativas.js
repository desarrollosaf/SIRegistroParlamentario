"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const parlamentariosConnection_1 = __importDefault(require("../database/parlamentariosConnection"));
const iniciativas_1 = __importDefault(require("./iniciativas"));
const nivel_autors_1 = __importDefault(require("./nivel_autors"));
class AutorIniciativa extends sequelize_1.Model {
}
AutorIniciativa.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true
    },
    iniciativa_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    tipo_autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    nivel_autor_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
    deletedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: parlamentariosConnection_1.default,
    tableName: 'autor_iniciativas',
    timestamps: true,
    paranoid: true,
});
// 👇 Asociaciones
AutorIniciativa.belongsTo(iniciativas_1.default, { foreignKey: 'iniciativa_id', as: 'iniciativa' });
AutorIniciativa.belongsTo(nivel_autors_1.default, { foreignKey: 'nivel_autor_id', as: 'nivel_autor' });
exports.default = AutorIniciativa;
