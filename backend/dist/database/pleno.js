"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeCuestionarios = new sequelize_1.Sequelize('pleno', 'usr_siregistro', 'T64X4ZOuiHRCnVWqHVEL', {
    host: '192.168.35.102',
    dialect: 'mysql',
    define: {
        freezeTableName: true
    }
});
exports.default = sequelizeCuestionarios;
