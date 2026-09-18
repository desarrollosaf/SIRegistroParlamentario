import { Sequelize } from "sequelize"

const sequelize = new Sequelize(
    process.env.DB_NAME_SAF || 'adminplem_saf',
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
            // 5 min en vez de 10s: evita abrir/cerrar conexiones de más entre
            // ráfagas intermitentes (voto → silencio → voto...) durante una
            // sesión. wait_timeout de MariaDB ya confirmado en 8h, así que
            // esto no compite con el timeout del servidor.
            idle: 5 * 60 * 1000,
            evict: 10000
        }
    }
)

// wait_timeout de MariaDB confirmado en 8h (no es la causa de los cortes
// vistos, que pasan en minutos) — el sospechoso real es algo intermedio
// (firewall/NAT/VPN) cerrando la conexión TCP mucho antes, sin avisar ni a
// Sequelize ni a MariaDB. min:2 no protege de eso: Sequelize no valida la
// conexión antes de entregarla del pool, así que si ya está muerta del lado
// de la red, la primera petición real se estrella igual. Este ping genera
// tráfico real para que cualquier capa intermedia la vea "viva" — dispara
// tantos pings como el `min` del pool para intentar tocar cada conexión
// mantenida viva, no solo una.
const KEEP_ALIVE_PINGS = 2; // igual al pool.min de arriba
setInterval(() => {
    for (let i = 0; i < KEEP_ALIVE_PINGS; i++) {
        sequelize.query('SELECT 1').catch(() => {});
    }
}, 4 * 60 * 1000);

export default sequelize


 