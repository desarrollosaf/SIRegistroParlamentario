import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('congreso_bd', 'congreso_backup', 'qvoMCK4aGaVffBY5Z95g', {
    host: '160.153.108.105',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



