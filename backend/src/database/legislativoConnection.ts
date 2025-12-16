import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('congreso_bd', 'homestead', 'secret', {
    host: '192.168.10.10',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



