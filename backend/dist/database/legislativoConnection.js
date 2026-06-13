"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeCuestionarios = new sequelize_1.Sequelize('legislativo', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true
    }
});
exports.default = sequelizeCuestionarios;
