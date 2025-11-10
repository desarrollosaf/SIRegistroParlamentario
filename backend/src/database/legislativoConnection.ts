import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminleg', 'homestead', 'secret', {
    host: '192.168.10.10',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



