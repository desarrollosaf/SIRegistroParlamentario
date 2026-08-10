import { Sequelize } from "sequelize"

const sequelize = new Sequelize('adminplem_saf', 'root', '', {
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



export default sequelize 


 