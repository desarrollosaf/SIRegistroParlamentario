import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_PLENO || 'pleno',
    process.env.DB_USER || 'homestead',
    process.env.DB_PASSWORD || 'secret',
    {
        host: process.env.DB_HOST || '192.168.10.10',
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



