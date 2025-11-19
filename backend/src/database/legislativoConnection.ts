import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('congreso_bd', 'congreso_backup', 'qvoMCK4aGaVffBY5Z95g', {
    host: '105.180.153.160',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



