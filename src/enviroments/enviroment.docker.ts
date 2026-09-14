export const enviroment = {
    production: true,
    // Solo para el build dentro de Docker: relativo al origen desde el que se
    // sirve la app, porque nginx.conf hace reverse proxy de /api, /socket.io y
    // /storage al contenedor del backend. Funciona igual sin importar la
    // IP/hostname con la que se acceda en la LAN, sin rebuild.
    // NO usar este esquema para el build del servidor real: ese usa su propio
    // proxy con prefijo /backend/ (ver enviroment.prod.ts).
    endpoint: '/'
  };
