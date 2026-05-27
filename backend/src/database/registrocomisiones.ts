import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_siregistroparlamentario2', 'usr_siregistro2', '0PilTYwMLzq52Cl', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }  
})



export default sequelizeCuestionarios 



