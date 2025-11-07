"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizefun = new sequelize_1.Sequelize('administracion', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true // evita que Sequelize pluralice
    }
});
exports.default = sequelizefun;
