import { Sequelize } from "sequelize"

// Vive en un servidor MySQL aparte del resto (192.168.35.102, no 192.168.36.53) —
// por eso tiene su propia variable de host en vez de compartir DB_HOST.
const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_PLENO || 'pleno',
    process.env.DB_USER || 'usr_siregistro',
    process.env.DB_PASSWORD || 'T64X4ZOuiHRCnVWqHVEL',
    {
        host: process.env.DB_HOST_PLENO || '192.168.35.102',
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



