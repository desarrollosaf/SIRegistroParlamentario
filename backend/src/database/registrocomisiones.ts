import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_REGISTROCOMISIONES || 'adminplem_siregistroparlamentario',
    process.env.DB_USER || 'usr_siregistro',
    process.env.DB_PASSWORD || 'T64X4ZOuiHRCnVWqHVEL',
    {
        host: process.env.DB_HOST || '192.168.36.53',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        define: {
            freezeTableName: true
        },
        pool: {
            max: 20,
            // min:0 dejaba cerrar TODAS las conexiones tras 10s de inactividad
            // (idle) — la siguiente petición pagaba el costo completo de
            // reconectar. Con min:2 siempre quedan conexiones vivas listas.
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    }
)



export default sequelizeCuestionarios 



