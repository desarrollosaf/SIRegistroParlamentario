import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_congresoedomex', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



