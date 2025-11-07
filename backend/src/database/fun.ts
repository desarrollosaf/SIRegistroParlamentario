import { Sequelize } from "sequelize"

const sequelizefun = new Sequelize('administracion', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true // evita que Sequelize pluralice
    }
})


export default sequelizefun 