import { Sequelize } from "sequelize"

const sequelizefun = new Sequelize('administracion', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true // evita que Sequelize pluralice
    },
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})


export default sequelizefun 