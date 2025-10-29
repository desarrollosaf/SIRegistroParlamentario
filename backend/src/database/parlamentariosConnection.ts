import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('citas_hombres', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



