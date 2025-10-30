import { Sequelize } from "sequelize"

const sequelize = new Sequelize('adminplem_saf', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }
})



export default sequelize 


 