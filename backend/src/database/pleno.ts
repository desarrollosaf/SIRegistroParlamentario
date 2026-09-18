import { Sequelize } from "sequelize"
import { createQueryLogger } from "./queryLogger"

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
        // Diagnóstico temporal (activar con DB_QUERY_LOGGING=true): tiempo
        // real de EJECUCIÓN de cada query, para comparar contra el tiempo
        // total de la petición ([LENTO] en server.ts) y saber si el retraso
        // está en la consulta en sí o en obtener/crear la conexión.
        benchmark: true,
        logging: createQueryLogger('pleno'),
        define: {
            freezeTableName: true
        },
        pool: {
            max: 20,
            // min:0 dejaba cerrar TODAS las conexiones tras 10s de inactividad
            // (idle) — la siguiente petición pagaba el costo completo de
            // reconectar (aquí es peor: este host está en otra red que las
            // demás). Con min:2 siempre quedan conexiones vivas listas.
            min: 2,
            acquire: 30000,
            // 5 min en vez de 10s: evita abrir/cerrar conexiones de más entre
            // ráfagas intermitentes durante una sesión. OJO: a diferencia de
            // connection.ts/legislativoConnection.ts/registrocomisiones.ts,
            // el wait_timeout de ESTE servidor (192.168.35.102) todavía no
            // se ha confirmado — solo se revisó el de .53.
            idle: 5 * 60 * 1000,
            evict: 10000
        }
    }
)

// Apagado por defecto (DB_KEEPALIVE_ENABLED=true para activarlo) mientras se
// mide la causa real de la lentitud — dejarlo corriendo podría ocultar el
// síntoma que se está tratando de diagnosticar. OJO: a diferencia de los
// otros 3 conectores, el wait_timeout/conntrack de ESTE servidor
// (192.168.35.102) todavía no se ha confirmado — solo se revisó el de .53.
if (process.env.DB_KEEPALIVE_ENABLED === 'true') {
    const KEEP_ALIVE_PINGS = 2; // igual al pool.min de arriba
    setInterval(() => {
        for (let i = 0; i < KEEP_ALIVE_PINGS; i++) {
            sequelizeCuestionarios.query('SELECT 1').catch(() => {});
        }
    }, 4 * 60 * 1000);
}

export default sequelizeCuestionarios



