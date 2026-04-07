import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('congreso_bd', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



