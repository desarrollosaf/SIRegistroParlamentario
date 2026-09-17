import { Sequelize } from "sequelize"

// Conexión de SOLO LECTURA al MySQL del sistema legado "spid" (Laravel,
// servidor propio, no tocar). Usada únicamente por services/spidVotingSync.ts
// para el espejo de contingencia — a diferencia de legislativoConnection.ts /
// connection.ts, aquí NO hay credenciales de producción hardcodeadas como
// fallback: si DB_HOST_SPID/DB_USER_SPID/DB_PASSWORD_SPID no están definidas,
// spidVotingSync.ts debe abstenerse de arrancar en vez de adivinar un host.
const spidConnection = new Sequelize(
    process.env.DB_NAME_SPID || 'adminplem_spid',
    process.env.DB_USER_SPID || '',
    process.env.DB_PASSWORD_SPID || '',
    {
        host: process.env.DB_HOST_SPID || '',
        port: Number(process.env.DB_PORT_SPID) || 3306,
        dialect: 'mysql',
        logging: false,
        define: {
            freezeTableName: true
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
)

export default spidConnection
