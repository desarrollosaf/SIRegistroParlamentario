import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('pleno', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



