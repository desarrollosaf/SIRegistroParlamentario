/**
 * Envuelve una función async cara para que su resultado se cachee por
 * `ttlMs`. Protege contra "cache stampede": si el caché vence justo cuando
 * llegan varias peticiones a la vez (p.ej. 75 diputados), TODAS comparten
 * la MISMA promesa en construcción en vez de recalcular cada una por su
 * cuenta — sin esto, un caché con TTL corto puede terminar generando el
 * mismo pico de carga que se quería evitar.
 */
export function createTtlCache<T>(fn: () => Promise<T>, ttlMs: number): () => Promise<T> {
    let cache: { data: T; expiraEn: number } | null = null;
    let enVuelo: Promise<T> | null = null;

    return function cachedFn(): Promise<T> {
        const ahora = Date.now();
        if (cache && cache.expiraEn > ahora) {
            return Promise.resolve(cache.data);
        }
        if (enVuelo) {
            return enVuelo;
        }
        enVuelo = fn()
            .then((data) => {
                cache = { data, expiraEn: Date.now() + ttlMs };
                return data;
            })
            .finally(() => {
                enVuelo = null;
            });
        return enVuelo;
    };
}
