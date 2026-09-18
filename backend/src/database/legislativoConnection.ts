import { Sequelize } from "sequelize"
import { createQueryLogger } from "./queryLogger"

const sequelizeCuestionarios = new Sequelize(
    process.env.DB_NAME_LEGISLATIVO || 'adminplem_congresoedomex',
    process.env.DB_USER || 'usr_siregistro',
    process.env.DB_PASSWORD || 'T64X4ZOuiHRCnVWqHVEL',
    {
        host: process.env.DB_HOST || '192.168.36.53',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        // Diagnóstico temporal (activar con DB_QUERY_LOGGING=true): tiempo
        // real de EJECUCIÓN de cada query, para comparar contra el tiempo
        // total de la petición ([LENTO] en server.ts) y saber si el retraso
        // está en la consulta en sí o en obtener/crear la conexión.
        benchmark: true,
        logging: createQueryLogger('legislativo'),
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
            // 5 min en vez de 10s: evita abrir/cerrar conexiones de más entre
            // ráfagas intermitentes (voto → silencio → voto...) durante una
            // sesión. wait_timeout de MariaDB ya confirmado en 8h, así que
            // esto no compite con el timeout del servidor.
            idle: 5 * 60 * 1000,
            evict: 10000
        }
    }
)

// wait_timeout (8h), conntrack (5 días) y TCP keepalive (2h) del servidor ya
// se confirmaron generosos — no hay evidencia de un timeout de red corto.
// Apagado por defecto (DB_KEEPALIVE_ENABLED=true para activarlo) mientras se
// mide la causa real: si se deja corriendo, puede ocultar el síntoma que
// se está tratando de diagnosticar.
if (process.env.DB_KEEPALIVE_ENABLED === 'true') {
    const KEEP_ALIVE_PINGS = 2; // igual al pool.min de arriba
    setInterval(() => {
        for (let i = 0; i < KEEP_ALIVE_PINGS; i++) {
            sequelizeCuestionarios.query('SELECT 1').catch(() => {});
        }
    }, 4 * 60 * 1000);
}

export default sequelizeCuestionarios



