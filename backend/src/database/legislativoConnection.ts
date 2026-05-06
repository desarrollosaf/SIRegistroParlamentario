import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_congresoedomex', 'usr_siregistro', 'T64X4ZOuiHRCnVWqHVEL', {
    host: '192.168.36.58',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }

    
})


export default sequelizeCuestionarios 



