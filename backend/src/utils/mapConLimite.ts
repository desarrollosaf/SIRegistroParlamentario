/**
 * Como `Promise.all(items.map(fn))`, pero con a lo más `limite` llamadas a
 * `fn` corriendo a la vez. Conserva el orden del resultado.
 *
 * Por qué existe: los reportes que hacían Promise.all sobre CIENTOS de
 * iniciativas (cada una con 3-6 consultas propias) lanzaban todas las
 * consultas de golpe y acaparaban las 20 conexiones del pool de
 * registrocomisiones — visto en producción: 154 consultas haciendo fila y
 * ~1s de espera por conexión para TODO lo demás, votos incluidos.
 * Con un tope, un reporte pesado usa solo unas pocas conexiones y deja el
 * resto libre para el registro en vivo.
 */
export const LIMITE_REPORTES = Number(process.env.REPORTE_CONCURRENCIA) || 4;

export async function mapConLimite<T, R>(items: T[], limite: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
    const resultado: R[] = new Array(items.length);
    let siguiente = 0;
    const trabajadores = Array.from({ length: Math.min(Math.max(1, limite), items.length) }, async () => {
        while (siguiente < items.length) {
            const i = siguiente++;
            resultado[i] = await fn(items[i], i);
        }
    });
    await Promise.all(trabajadores);
    return resultado;
}
