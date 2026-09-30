"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTtlCache = createTtlCache;
/**
 * Envuelve una función async cara para que su resultado se cachee por
 * `ttlMs`. Protege contra "cache stampede": si el caché vence justo cuando
 * llegan varias peticiones a la vez (p.ej. 75 diputados), TODAS comparten
 * la MISMA promesa en construcción en vez de recalcular cada una por su
 * cuenta — sin esto, un caché con TTL corto puede terminar generando el
 * mismo pico de carga que se quería evitar.
 */
function createTtlCache(fn, ttlMs) {
    let cache = null;
    let enVuelo = null;
    return function cachedFn() {
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
