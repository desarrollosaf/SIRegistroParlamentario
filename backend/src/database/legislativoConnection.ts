import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('legislativo', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



