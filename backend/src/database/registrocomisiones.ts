import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_siregistroparlamentario', 'root', 'root', {
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
})


export default sequelizeCuestionarios 



