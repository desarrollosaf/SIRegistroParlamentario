import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminleg', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



