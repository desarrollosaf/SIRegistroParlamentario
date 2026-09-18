// Instrumentación temporal para diagnosticar la lentitud intermitente
// reportada en detalle-comisión: activa con DB_QUERY_LOGGING=true, cada
// query real que corre Sequelize se loguea con el tiempo que tardó
// EJECUTARSE (una vez que ya se tiene la conexión) — así se puede comparar
// contra el tiempo total que reporta [LENTO] en server.ts. Si la petición
// completa tarda 6s pero aquí todas las queries salen en <50ms, el tiempo
// se está yendo en obtener/crear la conexión, no en la consulta en sí.
export function createQueryLogger(label: string) {
    return (sql: string, ms?: number) => {
        if (process.env.DB_QUERY_LOGGING !== 'true') return;
        console.log(`[SQL ${label} ${ms}ms] ${sql}`);
    };
}
