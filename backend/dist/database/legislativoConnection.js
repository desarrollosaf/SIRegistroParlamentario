"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeCuestionarios = new sequelize_1.Sequelize('adminplem_congresoedomex', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true
    },
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
exports.default = sequelizeCuestionarios;
