"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const legislativoConnection_1 = __importDefault(require("../database/legislativoConnection"));
const iniciativas_1 = __importDefault(require("./iniciativas"));
class DecretoIniciativa extends sequelize_1.Model {
}
DecretoIniciativa.init({
    id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
    },
    fecha_decreto: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    numero_decreto: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    nombre_decreto: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    iniciativa_id: {
        type: sequelize_1.DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'iniciativas',
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
    sequelize: legislativoConnection_1.default,
    tableName: 'decreto_iniciativas',
    timestamps: true,
    underscored: true, // Usa created_at / updated_at
});
// 👇 Asociación
DecretoIniciativa.belongsTo(iniciativas_1.default, {
    foreignKey: 'iniciativa_id',
    as: 'iniciativa',
});
exports.default = DecretoIniciativa;
