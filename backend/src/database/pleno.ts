import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('pleno', 'homestead', 'secret', {
    host: '192.168.10.10',
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



