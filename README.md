# SIRegistroParlamentario

Sistema de registro parlamentario: agenda, asistencias, votaciones del Pleno y comisiones, proyección, reportes y estadísticas.

- **Frontend:** Angular (este directorio), servido por nginx.
- **Backend:** Express + Sequelize + Socket.IO (`backend/`).
- **Despliegue:** Docker Compose en la VM `VM-61` (192.168.36.61).

---

# Plan de estabilidad de votaciones (octubre 2026)

**Objetivo:** que registrar votos y asistencias **nunca falle ni se alente**, aunque otros sistemas (la página pública del Congreso, SIPresidencia, inteligencia) estén haciendo consultas pesadas al mismo tiempo.

**Resultado:** con 75 diputados votando a la vez, 3 rondas seguidas y reportes pesados de fondo, el voto tarda **~23 ms dentro del servidor** (máximo 35 ms), y el proceso de votos **ya no se congela** por los reportes.

## Índice

1. [El problema (causa raíz)](#1-el-problema-causa-raíz)
2. [Arquitectura final](#2-arquitectura-final)
3. [Lo que se hizo, fase por fase](#3-lo-que-se-hizo-fase-por-fase)
4. [Archivos nuevos y modificados](#4-archivos-nuevos-y-modificados)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Cómo desplegar y cómo volver atrás](#6-cómo-desplegar-y-cómo-volver-atrás)
7. [Operación diaria: logs y métricas](#7-operación-diaria-logs-y-métricas)
8. [Prueba de carga (`prueba-carga.js`)](#8-prueba-de-carga-prueba-cargajs)
9. [Resultados de las pruebas (historial)](#9-resultados-de-las-pruebas-historial)
10. [Memoria (RAM) de la VM](#10-memoria-ram-de-la-vm)
11. [Problemas conocidos y qué hacer](#11-problemas-conocidos-y-qué-hacer)
12. [Pendientes](#12-pendientes)

---

## 1. El problema (causa raíz)

Registrar un voto **no es pesado**: son de 3 a 5 consultas pequeñas a la BD, con índices. El problema era que los votos **compartían todo** con lo pesado:

1. **Un solo proceso Node hacía todo:** votos, asistencias, sockets, reportes, estadísticas, Excel, PDFs y el sincronizador SPID. Node trabaja con **un solo hilo**: si un reporte ocupa el CPU 5 segundos, **todo** espera 5 segundos, incluidos los votos.
2. **Las mismas 20 conexiones a la BD.** Votos y reportes usaban el mismo pool de conexiones de `registrocomisiones`. Se encontró un reporte (`/api/iniciativas/iniciativas/`) que lanzaba **cientos de consultas a la vez** y dejaba 154 consultas haciendo fila, con casi 1 segundo de espera cada una, votos incluidos.
3. **El estado "votación/asistencia abierta" vivía solo en memoria.** Si el contenedor se reiniciaba a media votación, el servidor "olvidaba" que estaba abierta.
4. **El servidor no verificaba que la votación siguiera abierta.** En sesión plenaria, bastaba con mandar `idPunto` para votar aunque la votación ya estuviera cerrada.

**La BD no era el cuello de botella** (las pruebas lo confirmaron: la espera por conexión quedó en 0–5 ms). El cuello de botella era **el proceso Node compartido**.

---

## 2. Arquitectura final

```
Página pública (PACongresoEdomex) ──► :3013 ──► [ gateway (nginx) ] ──┬──► [ backend = NÚCLEO ]
SIPresidencia, capturadora, etc. ───► :3013 ──┘                       │     votos, asistencia, sockets,
Admin (navegador) ──► :8010 [ frontend nginx ] ──► gateway ───────────┘     pleno, capturadora, SPID,
                                                                       │     eventos, Presidencia,
                                                                       │     estadísticas EN VIVO
                                                                       │
                                                                       └──► [ backend-consultas ]
                                                                             reportes, estadísticas,
                                                                             inteligencia, lista de
                                                                             iniciativas (CPU pesado)

Ambos backends ──► la MISMA base de datos MySQL/MariaDB (sin cambios en la BD).
```

- **Misma imagen y mismo código** para los dos backends; solo cambia la variable `ROLE`.
- **El puerto 3013 no cambió**: ahora lo atiende el gateway. Ningún otro sistema tuvo que cambiar su configuración.
- **Si consultas se congela o se reinicia, los votos no se enteran**, porque corren en otro proceso.
- **La BD no cambió**: es el mismo servidor y las mismas tablas, más una tabla nueva y pequeña (`estado_eventos_abiertos`, ver Fase 1).

### Qué ruta va a qué contenedor (`gateway.conf`)

| Ruta | Contenedor |
|---|---|
| `/api/estadistico/getvotospunto/`, `/api/estadistico/getasistencia/`, `/api/estadistico/ultimasesion` | **Núcleo**: resultados en vivo de la página pública; consultas ligeras |
| `/api/reporte/` | Consultas |
| `/api/estadistico/` (el resto) | Consultas |
| `/api/inteligencia/` | Consultas |
| `/api/iniciativas/iniciativas/` | Consultas |
| `/socket.io/` | Núcleo |
| **Todo lo demás** (`/api/pleno/`, `/api/diputado/`, `/api/eventos/`, `/storage/`, ...) | Núcleo |

nginx elige el prefijo **más largo**, por eso las rutas en vivo de `/api/estadistico/...` ganan sobre `/api/estadistico/`.

---

## 3. Lo que se hizo, fase por fase

### Fase 0: medir antes de optimizar

Archivo nuevo `backend/src/utils/metricas.ts`. Mide, en memoria y sin consultar la BD:

- **Event loop:** cuánto tiempo estuvo Node bloqueado (si sube, Node estuvo ocupado con CPU y **todo** esperó).
- **Espera por conexión** de cada pool de BD (si sube, las conexiones estaban todas ocupadas).
- **Duración de cada voto/asistencia** dentro del servidor (lo que sintió el diputado, sin contar la red).

Solo escribe en los logs cuando algo sale mal:

| Log | Significa |
|---|---|
| `[EVENT-LOOP] p99=...` | Node estuvo bloqueado más de 100 ms en el último minuto |
| `[POOL-ESPERA] <pool>: Xms ...` | Una consulta esperó más de 200 ms por una conexión libre |
| `[VOTO-LENTO]` / `[ASISTENCIA-LENTO]` | Un registro tardó más de 500 ms dentro del servidor |
| `[LENTO] Xms GET ...` | (ya existía) Una petición HTTP tardó más de 800 ms |

Todo se puede consultar en **`GET /api/diagnostico/metricas`** (requiere sesión iniciada).

### Fase 1: blindar los votos

- **El estado sobrevive a los reinicios** (`backend/src/utils/estadoPersistente.ts`). Las asistencias, votaciones y sesiones abiertas se guardan en la tabla `estado_eventos_abiertos` cada vez que cambian (la tabla se crea sola). Al arrancar, el núcleo **recupera el estado antes de aceptar conexiones**. En el log se ve así: `[ESTADO] Recuperado tras reinicio: 1 asistencia(s), 0 votación(es), 1 sesión(es) abiertas`.
  - Las entradas con más de 24 horas se descartan (`ESTADO_EVENTOS_MAX_HORAS`).
  - Si la BD no responde en 15 segundos, el servidor arranca igual, como antes.
- **El servidor rechaza votos y asistencias si el evento ya está cerrado**: responde `409` con `codigo: 'EVENTO_CERRADO'` (en `backend/src/controllers/diputado.ts`). Usa el mismo criterio que la capturadora (reserva → `id_tema_punto_voto`; punto → `id_punto` + iniciativa).
  - Válvula de escape: `VALIDAR_EVENTO_ABIERTO=false` regresa al comportamiento anterior.

### Fase 2: "modo sesión"

`backend/src/middlewares/modoSesion.ts`. Cuando está activo, las rutas pesadas:

1. Responden **desde caché** (por URL + usuario). Son datos históricos, así que unos minutos de antigüedad no importan.
2. **Comparten la respuesta** entre peticiones idénticas: si 6 visitantes piden lo mismo mientras se arma, se arma **una vez**.
3. Tienen un **tope de concurrencia**: el resto espera turno y, si tarda demasiado, recibe `503` con `Retry-After`.

- **En el núcleo**, solo está activo mientras haya asistencia o votación abierta.
- **En consultas**, está **siempre activo** (con tope de 2). Ahí ya no protege a los votos, que están en otro proceso, sino al propio contenedor: sin el tope, armar todos los reportes a la vez agotó la memoria de Node y lo tumbó (ver [historial](#9-resultados-de-las-pruebas-historial)).
- Las rutas en vivo nunca pasan por aquí.

**Reportes con cientos de consultas a la vez** (`controllers/iniciativas.ts` y `controllers/reporte.ts`):

- Antes hacían `Promise.all` sobre **todas** las iniciativas a la vez. Ahora usan `mapConLimite` (`utils/mapConLimite.ts`): **máximo 4 iniciativas a la vez** (`REPORTE_CONCURRENCIA`).
- Además, el reporte base se **cachea 5 minutos** (`createTtlCache`, el mismo patrón que ya usaba `estadistico.ts`).

### Fase 3: separar en dos contenedores

Ver la [arquitectura](#2-arquitectura-final).

- `ROLE=nucleo`: todo lo en vivo. **No** monta reportes ni inteligencia.
- `ROLE=consultas`: solo reportes, estadísticas, inteligencia y la lista de iniciativas. **No** arranca sockets, SPID ni el estado de votaciones, y responde **404** a las rutas de voto. Así, si el gateway se equivocara, el error se ve de inmediato, en vez de registrar un voto mal.
- Sin `ROLE` (por ejemplo, `npm run dev` en local) corre **todo junto**, como antes.
- Consultas usa un pool de **10** conexiones (`DB_POOL_MAX=10`): nunca puede acaparar las conexiones de la BD.
- Consultas tiene un **límite de memoria** (`mem_limit: 1536m`, Node con `--max-old-space-size=1024`). Si se pasa, Docker reinicia **solo** ese contenedor.
- El nginx del front y el gateway re-resuelven los nombres de los contenedores cada 10 s (`resolver 127.0.0.11`). Así, recrear un contenedor no deja una IP vieja que causaría 502.

### Fase 4: prueba de carga

Script `backend/scripts/prueba-carga.js`. Ver la [sección 8](#8-prueba-de-carga-prueba-cargajs).

### Correcciones menores encontradas en el camino

- `estadistico.ts`: `req.body.id` tronaba con 500 en GETs sin cuerpo (4 funciones). Ahora usa `req.body?.id`.
- `diagnostico.ts`: nuevo endpoint `GET /api/diagnostico/metricas`.

---

## 4. Archivos nuevos y modificados

| Archivo | Qué es |
|---|---|
| `docker-compose.yml` | 4 servicios: `backend` (núcleo), `backend-consultas`, `gateway`, `frontend` |
| `gateway.conf` | **Nuevo.** Reparte las peticiones entre núcleo y consultas |
| `nginx.conf` | El front ahora manda `/api`, `/storage` y `/socket.io` al gateway |
| `backend/src/models/server.ts` | `ROLE`, mapas persistentes, carga del estado al arrancar, modo sesión |
| `backend/src/index.ts` | Registro de métricas de pools; SPID solo en el núcleo |
| `backend/src/utils/metricas.ts` | **Nuevo.** Fase 0 |
| `backend/src/utils/estadoPersistente.ts` | **Nuevo.** Fase 1: `MapaPersistente` |
| `backend/src/middlewares/modoSesion.ts` | **Nuevo.** Fase 2: caché, respuestas compartidas y tope |
| `backend/src/utils/mapConLimite.ts` | **Nuevo.** Tope de concurrencia para reportes |
| `backend/src/controllers/diputado.ts` | Validación de evento abierto y medición de tiempos |
| `backend/src/controllers/iniciativas.ts`, `reporte.ts` | Tope de 4 + caché de 5 min en el reporte base |
| `backend/src/controllers/estadistico.ts` | `req.body?.id` |
| `backend/src/controllers/diagnostico.ts`, `routes/diagnostico.ts` | Endpoint de métricas |
| `backend/src/database/*.ts` | El tamaño del pool se configura con `DB_POOL_MAX` |
| `backend/scripts/prueba-carga.js` | **Nuevo.** Fase 4 |
| `backend/.env.example` | Variables nuevas documentadas |

---

## 5. Variables de entorno

**Todas son opcionales**: ya traen buenos valores por defecto. No hace falta agregarlas al `.env` de producción.

| Variable | Default | Para qué |
|---|---|---|
| `METRICAS_UMBRAL_EVENT_LOOP_MS` | 100 | A partir de cuánto se escribe `[EVENT-LOOP]` |
| `METRICAS_UMBRAL_POOL_MS` | 200 | A partir de cuánto se escribe `[POOL-ESPERA]` |
| `METRICAS_UMBRAL_REGISTRO_MS` | 500 | A partir de cuánto se escribe `[VOTO-LENTO]` |
| `VALIDAR_EVENTO_ABIERTO` | true | `false` = aceptar votos aunque el evento esté cerrado (comportamiento anterior) |
| `ESTADO_EVENTOS_MAX_HORAS` | 24 | Antigüedad máxima para revivir un evento abierto tras un reinicio |
| `MODO_SESION_ENABLED` | true | `false` = apagar el modo sesión por completo |
| `MODO_SESION_CACHE_TTL_MS` | 600000 | Vida de la caché (consultas usa 300000) |
| `MODO_SESION_MAX_CONCURRENTES` | 3 | Reportes pesados a la vez (consultas usa 2) |
| `MODO_SESION_ESPERA_MAX_MS` | 20000 | Espera máxima en fila antes de responder 503 (consultas usa 90000) |
| `MODO_SESION_CACHE_MAX_MB` | 100 | Tope de memoria de la caché (consultas usa 150) |
| `REPORTE_CONCURRENCIA` | 4 | Iniciativas procesadas a la vez al armar un reporte |
| `ROLE` | completo | `nucleo` / `consultas` / `completo`. **Lo pone `docker-compose.yml`**, no va en el `.env` |
| `DB_POOL_MAX` | 20 | Conexiones máximas por pool. **Lo pone `docker-compose.yml`** (consultas = 10) |

Para cambiar una variable en producción: edita `backend/.env` y luego corre `docker compose up -d`. **`restart` no relee el `.env`**: hay que usar `up -d`.

---

## 6. Cómo desplegar y cómo volver atrás

**Desplegar** (en la VM, de preferencia **fuera de una sesión**, aunque la Fase 1 recupera los eventos abiertos):

```bash
git pull
docker compose up -d --build
```

**Verificar:**

```bash
docker compose ps                                     # backend, backend-consultas, gateway, frontend → Up
docker compose logs backend | grep ROLE               # → nucleo
docker compose logs backend-consultas | grep ROLE     # → consultas
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3013/api/estadistico/iniciativas/resumen   # → 200
```

Revisar también:
- [ ] El admin inicia sesión y la proyección se conecta (en `logs backend` aparece `Socket conectado`).
- [ ] Abrir y cerrar asistencia/votación: la proyección reacciona.
- [ ] La página pública carga iniciativas y órdenes del día.
- [ ] SIPresidencia ve la agenda.
- [ ] Subir un archivo y descargar el PDF del orden del día (volumen `storage` compartido).

**Volver atrás** (regresar a un solo backend):

```bash
git checkout <commit-anterior> -- docker-compose.yml nginx.conf
docker compose up -d --build --remove-orphans
```

**Apagar solo una parte, sin tocar código:**

| Problema | Qué cambiar en `backend/.env` |
|---|---|
| Diputados que no pueden votar y reciben `409 EVENTO_CERRADO` | `VALIDAR_EVENTO_ABIERTO=false` |
| Reportes con 503 o datos desactualizados durante una sesión | `MODO_SESION_ENABLED=false` |

Después: `docker compose up -d`.

---

## 7. Operación diaria: logs y métricas

```bash
docker compose logs -f backend              # núcleo: votos, asistencia, sockets, [ESTADO], [VOTO-LENTO]
docker compose logs -f backend-consultas    # reportes: [LENTO], [POOL-ESPERA] de consultas
docker compose logs -f gateway              # 502 = el contenedor de destino no respondió

# Ver solo lo importante de los dos backends:
docker compose logs -f backend backend-consultas | grep -E "LENTO|EVENT-LOOP|POOL|ESTADO|heap"

# Memoria y CPU en vivo:
docker stats siregistroparlamentario-backend-1 siregistroparlamentario-backend-consultas-1

# ¿Consultas se ha reiniciado o quedado sin memoria?
docker inspect -f 'OOMKilled={{.State.OOMKilled}} reinicios={{.RestartCount}}' siregistroparlamentario-backend-consultas-1
docker compose logs backend-consultas | grep -c "heap out of memory"
```

**Métricas del núcleo:** `GET /api/diagnostico/metricas`, con sesión iniciada. Fuera del navegador, se manda el token en `Authorization: Bearer <token>`.

**Cómo leer las métricas:**
- `eventLoop.max` alto (más de ~200 ms) en el núcleo → algo pesado de CPU se coló en el núcleo.
- `pools.<x>.esperaMs.max` alto → las conexiones se llenaron.
- `registros.voto.p95` → lo que tarda un voto dentro del servidor (meta: 300 ms o menos; hoy ~23 ms).

---

## 8. Prueba de carga (`prueba-carga.js`)

Simula a los 75 diputados registrando **todos a la vez**, mientras 6 clientes piden reportes pesados y 2 clientes de "Presidencia" consultan la agenda.

> ⚠️ **Escribe votos y asistencias reales.** Úsala solo en un **evento de prueba**, nunca en una sesión real.

Se corre desde una PC con Node 20+, en la carpeta `backend/`. La lista de diputados la toma del propio servidor (`/api/estadistico/getasistencia/:idAgenda`), así que **no necesita acceso a la BD**.

### Paso a paso

1. **Token** (opcional, pero recomendado: permite calificar con el tiempo real del servidor). En Chrome, con sesión iniciada en el admin, abre F12 → **Application** → **Cookies** → copia el valor de `accessToken`. **No lo compartas**: es tu sesión de administrador.
2. En el admin, abre la **asistencia** o **inicia y abre la votación** de un punto del evento de prueba.
3. **Saca el id del punto automáticamente** (no escribe nada):
   ```powershell
   node scripts/prueba-carga.js --url https://parlamentario.congresoedomex.gob.mx --modo estado --agenda <idAgenda>
   ```
   Imprime si la asistencia o votación está abierta y, si hay votación, **el comando listo para copiar** con el `--punto` correcto.
4. **Prueba de votación:**
   ```powershell
   node scripts/prueba-carga.js --confirmo --si-es-produccion --url https://parlamentario.congresoedomex.gob.mx --modo voto --agenda <idAgenda> --punto <idPunto> --rondas 3 --limpiar --token <accessToken>
   ```
5. **Prueba de asistencia** (solo funciona una vez por evento; después, todos responden `409` "ya registrada"):
   ```powershell
   node scripts/prueba-carga.js --confirmo --si-es-produccion --url https://parlamentario.congresoedomex.gob.mx --modo asistencia --agenda <idAgenda> --token <accessToken>
   ```
6. **Prueba de reinicio:** abre una votación, corre `docker compose restart backend` en la VM y luego el paso 3. Debe seguir diciendo `votación=ABIERTA`.

### Opciones

| Opción | Qué hace |
|---|---|
| `--modo voto \| asistencia \| estado` | Qué se prueba. `estado` solo lee |
| `--punto`, `--iniciativa`, `--reserva` | Qué se vota (los da `--modo estado`) |
| `--rondas N` | Los 75 votan N veces seguidas |
| `--carga-pesada N` | Clientes pidiendo reportes de fondo (default 6) |
| `--limpiar` | Al final regresa los votos a PENDIENTE |
| `--token` | Califica con el tiempo **dentro del servidor**, sin la red |
| `--meta-p95 ms` | Meta de p95 (default 300) |
| `--ids archivo.json` | Lista propia de `diputado_id` |
| `--confirmo` | Obligatorio para modos que escriben |
| `--si-es-produccion` | Obligatorio si la URL es del dominio de producción |

### Cómo leer el resultado

| Mensaje | Significa |
|---|---|
| `VOTO ... estados={"200":225}` | Todos registrados |
| `409` en voto | La votación de **ese** punto no está abierta (¿abriste otro punto? Usa `--modo estado`) |
| `409` en asistencia | Ya estaba registrada (normal si repites la prueba) |
| `404` | Ese diputado no tiene registro para ese punto o agenda |
| `red` / `timeout` | La petición se perdió en la red, **no llegó al backend** |
| `503` en consultas | El modo sesión pospuso un reporte (intencional) |
| `502` en consultas | El contenedor de consultas no respondió (ver la [sección 11](#11-problemas-conocidos-y-qué-hacer)) |
| `Tiempo DENTRO del servidor` | Lo que importa. La tabla de arriba incluye red, TLS y nginx desde tu PC |

El script hace un **calentamiento** antes de medir: cada diputado simulado abre su conexión primero, como en la vida real, donde la app ya está conectada cuando se abre la votación.

La ruta del **Excel** (`/api/reporte/iniciativas/general/`) está **comentada** en el script, porque ese Excel no se descarga durante una sesión en vivo.

---

## 9. Resultados de las pruebas (historial)

| Momento | Hallazgo | Acción |
|---|---|---|
| Fase 0 en producción | `[POOL-ESPERA]` con **154 consultas en fila**, ~921 ms de espera; `/api/iniciativas/iniciativas/` tardó **32.7 s** | Tope de 4 + caché en los reportes de `iniciativas.ts` y `reporte.ts` |
| Prueba de reinicio | `[ESTADO] Recuperado tras reinicio: 1 asistencia(s)` | ✔ Fase 1 validada |
| Asistencia, 75 a la vez | 75/75 OK; sin `[POOL-ESPERA]` | ✔ |
| Voto en el punto **equivocado** | 223 × `409` | ✔ La Fase 1 rechazó votos en un punto cerrado (era un error del comando, no del sistema) |
| Voto, todo en un proceso | Voto p95 = 37 ms, pero **event loop max = 2.9 s**, causado por la descarga del **Excel** | Excel comentado en el script (no se usa en vivo) |
| Voto, todo en un proceso, sin Excel | **Event loop max = 5.4 s**; 4 votos de **~5.5 s** (`[VOTO-LENTO]`), por reconstruir reportes con la caché vencida | Se decidió hacer la Fase 3 |
| **Voto con la Fase 3 (separados)** | **Event loop max = 24 ms**; voto p95 = **23 ms**, máximo **35 ms**; 0 `[VOTO-LENTO]` | ✔ Votos aislados de los reportes |
| Fase 3, consultas | **502** en reportes: consultas se reinició 3 veces por `JavaScript heap out of memory`. La página pública mostró "No se encontraron iniciativas" | Tope de 2 siempre activo en consultas, respuestas compartidas, caché con tope en MB, heap de 1 GB, `mem_limit` de 1.5 GB, y las rutas en vivo pasaron al núcleo. **Pendiente de volver a probar** |
| Todas las pruebas | Entre 1 y 3 peticiones por prueba se pierden en la **red** (7 en total) | Pendiente: reintento automático en la app |

---

## 10. Memoria (RAM) de la VM

- **VM-61:** 4 núcleos, **3.4 GB de RAM, sin swap**.
- `mem_limit` del contenedor es **solo un tope**, no le da RAM nueva a nadie: todos los contenedores comparten la RAM de la VM.
- Reparto aproximado en el peor caso:

  | Quién | Uso aproximado |
  |---|---|
  | Núcleo | 100–200 MB |
  | Consultas | hasta **1.5 GB** (tope) |
  | MySQL de SIPresidencia | ~450 MB |
  | Otros (SIPresidencia, frontends, cámaras) | ~150 MB |
  | Sistema operativo y caché de disco | ~500 MB o más |
  | **Total** | **~2.9 GB de 3.4 GB** |

- **No conviene subir más el tope de consultas** sin darle más RAM a la VM. Sin swap, si la RAM se llena, Linux mata procesos y puede elegir **el núcleo de votos o el MySQL de SIPresidencia**.
- **Si se necesita más RAM:**
  1. Pedir que la VM suba a **6–8 GB** (lo más sano). Con eso, el tope de consultas puede subir a ~3 GB.
  2. Agregar **2 GB de swap** como red de seguridad: no acelera nada, pero evita que se maten procesos.
- **Decisión:** primero medir con `docker stats` durante la prueba de carga. Si consultas se queda **por debajo de ~1 GB**, no hace falta nada. Si se acerca a 1.5 GB o se reinicia, hay que pedir más RAM.

---

## 11. Problemas conocidos y qué hacer

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `502` en reportes o página pública | Consultas se reinició o se quedó sin memoria | `docker inspect ... RestartCount` y `grep "heap out of memory"` ([sección 7](#7-operación-diaria-logs-y-métricas)). Ver la [sección 10](#10-memoria-ram-de-la-vm) |
| `409 EVENTO_CERRADO` al votar | La votación de ese punto no está abierta en el servidor | Revisar en el admin que el punto correcto esté abierto. Emergencia: `VALIDAR_EVENTO_ABIERTO=false` |
| `[EVENT-LOOP]` en `logs backend` durante una votación | Algo pesado de CPU está corriendo en el **núcleo** | Ver qué `[LENTO]` aparece al mismo tiempo en `logs backend`. Debería estar en consultas, así que habría que moverlo en `gateway.conf` |
| `[spid-sync] lectura a spid lenta: 5000ms` | La BD de SPID responde lento | Es otra BD y otras conexiones, no frena los votos de la app. Si se repite, revisar ese servidor |
| Descargar el Excel de iniciativas tarda 2–3 s | Generar el Excel es CPU puro | Ya corre en consultas, así que no afecta a los votos |
| `GET /api/diputados/terminarvotacion/:id → 404` en la consola | El punto no tiene iniciativa en estudio ligada, o no tiene votos | Es normal: el front ya lo maneja y termina la votación igual |
| `[proyeccion] Mostrando lista de respaldo guardada localmente...` | La proyección pinta la última lista guardada mientras responde el servidor | Es normal y conviene dejarlo: no afecta votos |

---

## 12. Pendientes

- [ ] **Volver a probar la Fase 3** después de la corrección de memoria de consultas: 0 reinicios, 0 `heap out of memory`, 0 `502`, y medir el pico de RAM con `docker stats`.
- [ ] **Reintento automático del voto en la app** (`src/app/core/services/diputado.service.ts` y `src/app/service/pleno.service.ts`): 2 o 3 reintentos **solo ante fallas de red** (status 0). Es seguro, porque repetir el mismo voto deja el mismo resultado. Hoy es el punto débil principal.
- [ ] Confirmar el `max_connections` de la BD (`SHOW VARIABLES LIKE 'max_connections';`). Con dos backends, el máximo teórico de conexiones sube, aunque las pruebas usaron muy pocas.
- [ ] (Opcional) Reescribir los reportes de `iniciativas.ts` y `reporte.ts` con pocas consultas grandes, como ya está hecho en `estadistico.ts`, para que bajen de ~20 s a 1–2 s la primera vez.
- [ ] (Opcional) Cachear los Excel ya generados.
- [ ] (Opcional) Si la RAM no alcanza: subir la VM a 6–8 GB y/o agregar swap.

---

# Desarrollo (Angular)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## COMANDOS PARA PROBAR ASISTENCIA Y VOTACIONES


node scripts/prueba-carga.js --confirmo --si-es-produccion --url https://parlamentario.congresoedomex.gob.mx --modo voto --agenda 02669713-d74f-43f7-9c03-96999d41adef --punto 5764 --rondas 3 --limpiar --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZmMiOiJQQVIyNVNBR005OTAyMjAiLCJyb2xlIjoiQWRtaW5pc3RyYWRvciIsImludGVncmFudGVfbGVnaXNsYXR1cmFfaWQiOm51bGwsImlhdCI6MTc5MTU2NTk1MSwiZXhwIjoxNzkxNjE5OTUxfQ.GguB7YhsRYhxzEx3TV2Xeb6975nXO2W3ZGBCBYAxauI



node scripts/prueba-carga.js --confirmo --si-es-produccion --url https://parlamentario.congresoedomex.gob.mx --modo asistencia --agenda 02669713-d74f-43f7-9c03-96999d41adef