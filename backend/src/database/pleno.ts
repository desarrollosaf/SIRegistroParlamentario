import { Sequelize } from "sequelize"

<<<<<<< HEAD
const sequelizeCuestionarios = new Sequelize('pleno', 'usr_siregistro', 'T64X4ZOuiHRCnVWqHVEL', {
    host: '192.168.35.102',
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
>>>>>>> e5f037e017d5bda08a33a28acebe4e719a603356
    }
)


export default sequelizeCuestionarios 



