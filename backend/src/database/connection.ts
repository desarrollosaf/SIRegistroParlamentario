import { Sequelize } from "sequelize"

const sequelize = new Sequelize('adminplem_saf', 'homestead', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }
})



export default sequelize 


 