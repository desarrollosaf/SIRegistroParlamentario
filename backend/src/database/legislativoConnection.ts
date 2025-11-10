import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminleg_bd', 'adminleg_backup', 'qvoMCK4aGaVffBY5Z95g', {
    host: '72.167.46.27',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



