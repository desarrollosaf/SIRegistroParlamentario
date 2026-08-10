import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_siregistroparlamentario', 'usr_siregistro', 'T64X4ZOuiHRCnVWqHVEL', {
    host: '192.168.36.53',
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



