import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_LEGISLATIVO || 'adminplem_congresoedomex',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        define: {
            freezeTableName: true
        },
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
)


export default sequelizeCuestionarios 



