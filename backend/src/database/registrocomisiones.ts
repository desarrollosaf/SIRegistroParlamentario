import { Sequelize } from "sequelize"

<<<<<<< HEAD
const sequelizeCuestionarios = new Sequelize('adminplem_siregistroparlamentario', 'usr_siregistro', 'T64X4ZOuiHRCnVWqHVEL', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true
    },
    pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
=======
const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_REGISTROCOMISIONES || 'adminplem_siregistroparlamentario',
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
>>>>>>> e5f037e017d5bda08a33a28acebe4e719a603356
    }
)



export default sequelizeCuestionarios 



