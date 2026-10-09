/**
 * Fase 4 del plan de estabilidad: prueba de concurrencia.
 *
 * Simula a los diputados votando (o pasando asistencia) TODOS A LA VEZ,
 * mientras otros "sistemas" golpean reportes/estadísticas pesadas y
 * Presidencia consulta la agenda y el orden del día. Mide cuánto tarda cada
 * voto y dice si la prueba PASA o FALLA.
 *
 * ⚠ ESCRIBE VOTOS/ASISTENCIAS REALES en la BD a la que apunte el backend.
 *   Correrla en un evento de PRUEBA, nunca en una sesión real.
 *
 * Requisitos: Node 20+ (usa fetch). Desde la carpeta backend/:
 *
 *   1) En el admin, abrir la VOTACIÓN (o asistencia) del evento de prueba.
 *   2) Correr, por ejemplo:
 *
 *      node scripts/prueba-carga.js --confirmo --url http://<IP-VM>:8010 \
 *           --modo voto --agenda <idAgenda> --punto <idPunto> \
 *           --rondas 3 --carga-pesada 8 --token <JWT admin opcional>
 *
 *      (reserva: --reserva <idTemaPuntoVoto>; con iniciativa: --iniciativa <id>)
 *      (asistencia: --modo asistencia --agenda <idAgenda>)
 *
 *   Los diputados se toman del propio servidor (lista de asistencia del
 *   evento, ruta pública /api/estadistico/getasistencia/:idAgenda). Si eso
 *   falla, de la BD (DB_HOST/DB_USER/DB_PASSWORD en backend/.env) o de
 *   --ids archivo.json (arreglo de diputado_id).
 *
 * Prueba de reinicio (verifica la Fase 1):
 *   1) Abrir votación en el admin.
 *   2) docker compose restart backend
 *   3) node scripts/prueba-carga.js --modo estado --url ... --agenda <id>
 *      → debe decir que la votación SIGUE ABIERTA para los diputados.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');

// ── Argumentos ─────────────────────────────────────────────────────────
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const sig = process.argv[i + 1];
  if (sig === undefined || sig.startsWith('--')) args[a.slice(2)] = true;
  else { args[a.slice(2)] = sig; i++; }
}

const URL_BASE = String(args.url || 'http://localhost:3013').replace(/\/$/, '');
const MODO = args.modo || 'voto';
const AGENDA = args.agenda;
const PUNTO = args.punto || null;
const INICIATIVA = args.iniciativa || null;
const RESERVA = args.reserva || null;
const RONDAS = Number(args.rondas) || 1;
const CARGA_PESADA = args['carga-pesada'] !== undefined ? Number(args['carga-pesada']) : 6;
const TOKEN = args.token || null;
const META_P95_MS = Number(args['meta-p95']) || 300;

function salir(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!AGENDA) salir('Falta --agenda <idAgenda>');
if (!['voto', 'asistencia', 'estado'].includes(MODO)) salir('--modo debe ser voto | asistencia | estado');
if (MODO === 'voto' && !PUNTO && !RESERVA) salir('Para --modo voto falta --punto <idPunto> o --reserva <idTemaPuntoVoto>');
if (MODO !== 'estado' && !args.confirmo) {
  salir('Esta prueba ESCRIBE votos/asistencias reales. Si estás en un evento de prueba, agrega --confirmo');
}
if (MODO !== 'estado' && /congresoedomex\.gob\.mx/.test(URL_BASE) && !args['si-es-produccion']) {
  salir('La URL parece de PRODUCCIÓN. Si de verdad quieres correrla ahí (evento de prueba), agrega --si-es-produccion');
}

// ── Utilidades de medición ─────────────────────────────────────────────
class Grupo {
  constructor(nombre) { this.nombre = nombre; this.tiempos = []; this.estados = {}; this.errores = 0; }
  anotar(ms, status) {
    this.tiempos.push(ms);
    this.estados[status] = (this.estados[status] || 0) + 1;
    if (!(status >= 200 && status < 300)) this.errores++;
  }
  p(q) {
    const o = [...this.tiempos].sort((a, b) => a - b);
    return o.length ? o[Math.min(o.length - 1, Math.floor(q * o.length))] : 0;
  }
  linea() {
    const o = this.tiempos;
    return `${this.nombre.padEnd(22)} n=${String(o.length).padEnd(5)} p50=${String(this.p(0.5)).padEnd(6)}p95=${String(this.p(0.95)).padEnd(6)}max=${String(o.length ? Math.max(...o) : 0).padEnd(6)} estados=${JSON.stringify(this.estados)}`;
  }
}

async function pedir(grupo, metodo, ruta, body) {
  const inicio = Date.now();
  let status = 0;
  let json = null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const r = await fetch(URL_BASE + ruta, { method: metodo, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60000) });
    status = r.status;
    try { json = await r.json(); } catch { /* respuestas no-JSON (PDF/Excel) */ }
  } catch (e) {
    status = e.name === 'TimeoutError' ? 'timeout' : 'red';
  }
  grupo?.anotar(Date.now() - inicio, status);
  return { status, json };
}

// ── Diputados ──────────────────────────────────────────────────────────
async function obtenerDiputados() {
  if (args.ids) {
    const ids = JSON.parse(fs.readFileSync(args.ids, 'utf8'));
    if (!Array.isArray(ids) || !ids.length) salir('--ids debe ser un arreglo JSON de diputado_id');
    return ids.map(String);
  }

  // 1) Del servidor: no requiere acceso a la BD desde esta PC.
  const { status, json } = await pedir(null, 'GET', `/api/estadistico/getasistencia/${encodeURIComponent(AGENDA)}`);
  if (status === 200) {
    const ids = new Set();
    // Sesión: lista plana; comisiones: agrupada por comisión. Se recorre todo.
    const recorrer = (x) => {
      if (Array.isArray(x)) return x.forEach(recorrer);
      if (x && typeof x === 'object') {
        if (x.id_diputado) ids.add(String(x.id_diputado));
        Object.values(x).forEach((v) => { if (v && typeof v === 'object') recorrer(v); });
      }
    };
    recorrer(json?.integrantes);
    if (ids.size) {
      console.log(`Diputados obtenidos del servidor (lista de asistencia del evento): ${ids.size}`);
      return [...ids];
    }
    console.log('El servidor respondió, pero el evento no tiene lista de asistencia todavía. Se intenta con la BD...');
  } else {
    console.log(`No se pudo obtener la lista del servidor (http=${status}). Se intenta con la BD...`);
  }

  // 2) Respaldo: BD directa. Credenciales SOLO desde backend/.env.
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    salir('No hay DB_HOST/DB_USER/DB_PASSWORD en backend/.env para el respaldo por BD. Usa --ids archivo.json con los diputado_id.');
  }
  const mysql = require('mysql2/promise');
  let cx;
  try {
    cx = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_REGISTROCOMISIONES || 'adminplem_siregistroparlamentario',
      connectTimeout: 10000,
    });
  } catch (e) {
    salir(`No se pudo conectar a la BD ${process.env.DB_HOST} (${e.code || e.message}). Usa --ids archivo.json con los diputado_id.`);
  }
  try {
    let filas;
    if (MODO === 'voto') {
      if (RESERVA) {
        [filas] = await cx.query('SELECT DISTINCT id_diputado FROM votos_punto WHERE id_tema_punto_voto = ?', [RESERVA]);
      } else if (INICIATIVA) {
        [filas] = await cx.query('SELECT DISTINCT id_diputado FROM votos_punto WHERE id_punto = ? AND id_iniciativa = ?', [PUNTO, INICIATIVA]);
      } else {
        [filas] = await cx.query('SELECT DISTINCT id_diputado FROM votos_punto WHERE id_punto = ? AND id_iniciativa IS NULL', [PUNTO]);
      }
    } else {
      [filas] = await cx.query('SELECT DISTINCT id_diputado FROM asistencia_votos WHERE id_agenda = ?', [AGENDA]);
    }
    return filas.map((f) => String(f.id_diputado)).filter(Boolean);
  } finally {
    await cx.end();
  }
}

// ── Carga de fondo: otros sistemas + Presidencia ───────────────────────
const RUTAS_PESADAS = [
  '/api/reporte/iniciativas/estadisticas/',
  '/api/reporte/iniciativas/general/',
  '/api/estadistico/iniciativas/resumen',
  '/api/estadistico/getordenes',
  '/api/iniciativas/iniciativas/',
  '/api/inteligencia/todos/integrantes/',
];

function rutasPresidencia() {
  const r = [`/api/eventos/getagenda/${AGENDA}`, `/api/eventos/getpuntos/${AGENDA}`, '/api/estadistico/getordendia'];
  if (PUNTO) r.push(`/api/estadistico/getvotospunto/${PUNTO}`);
  return r;
}

function iniciarCargaFondo(gPesada, gPresidencia, sigue) {
  const trabajadores = [];
  for (let i = 0; i < CARGA_PESADA; i++) {
    trabajadores.push((async () => {
      let k = i;
      while (sigue()) await pedir(gPesada, 'GET', RUTAS_PESADAS[k++ % RUTAS_PESADAS.length]);
    })());
  }
  // Presidencia: 2 clientes consultando cada ~500ms (como un tablero en vivo).
  const presi = rutasPresidencia();
  for (let i = 0; i < 2; i++) {
    trabajadores.push((async () => {
      let k = i;
      while (sigue()) {
        await pedir(gPresidencia, 'GET', presi[k++ % presi.length]);
        await new Promise((r) => setTimeout(r, 500));
      }
    })());
  }
  return Promise.all(trabajadores);
}

// ── Modos ──────────────────────────────────────────────────────────────
async function modoEstado(diputados) {
  const muestra = diputados.slice(0, 5);
  console.log(`Consultando estado de ${muestra.length} diputado(s) para la agenda ${AGENDA}...\n`);
  for (const id of muestra) {
    const { status, json } = await pedir(null, 'GET', `/api/pleno/estado/${id}?idAgenda=${encodeURIComponent(AGENDA)}`);
    const asis = json?.asistencia ? (json.asistencia.yaRegistro ? 'abierta (ya registró)' : 'ABIERTA') : 'cerrada';
    const vot = json?.votacion ? 'ABIERTA' : 'cerrada';
    console.log(`  ${id}  http=${status}  asistencia=${asis}  votación=${vot}`);
  }
  console.log('\nTras un reinicio, si estaba abierta antes, aquí debe seguir ABIERTA.');
}

async function modoRegistro(diputados) {
  const gRegistro = new Grupo(MODO === 'voto' ? 'VOTO (diputados)' : 'ASISTENCIA (diputados)');
  const gPesada = new Grupo('Consultas pesadas');
  const gPresidencia = new Grupo('Presidencia (en vivo)');

  let corriendo = true;
  console.log(`Arrancando carga de fondo: ${CARGA_PESADA} clientes pesados + 2 de Presidencia...`);
  const fondo = iniciarCargaFondo(gPesada, gPresidencia, () => corriendo);
  await new Promise((r) => setTimeout(r, 2000)); // que la carga ya esté encima

  const rondas = MODO === 'asistencia' ? 1 : RONDAS;
  for (let ronda = 1; ronda <= rondas; ronda++) {
    console.log(`Ronda ${ronda}/${rondas}: ${diputados.length} diputados registrando al mismo tiempo...`);
    await Promise.all(diputados.map((id) => {
      if (MODO === 'asistencia') {
        return pedir(gRegistro, 'POST', '/api/pleno/asistencia', { diputado_id: id, id_agenda: AGENDA });
      }
      return pedir(gRegistro, 'POST', '/api/pleno/voto', {
        diputado_id: id,
        sentido_voto: 1 + Math.floor(Math.random() * 3),
        idPunto: PUNTO,
        idIniciativa: INICIATIVA,
        idReserva: RESERVA,
      });
    }));
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (args.limpiar && MODO === 'voto') {
    console.log('Regresando los votos a PENDIENTE (--limpiar)...');
    await Promise.all(diputados.map((id) => pedir(null, 'POST', '/api/pleno/voto', {
      diputado_id: id, sentido_voto: 0, idPunto: PUNTO, idIniciativa: INICIATIVA, idReserva: RESERVA,
    })));
  }

  corriendo = false;
  await fondo;

  console.log('\n──────── Resultados (ms) ────────');
  console.log(gRegistro.linea());
  console.log(gPresidencia.linea());
  console.log(gPesada.linea());

  if (TOKEN) {
    const { status, json } = await pedir(null, 'GET', '/api/diagnostico/metricas');
    if (status === 200) {
      console.log('\n──────── Métricas del servidor ────────');
      console.log('Event loop (ventana actual):', JSON.stringify(json.eventLoop?.ventanaActual));
      for (const [n, p] of Object.entries(json.pools || {})) {
        console.log(`Pool ${n.padEnd(20)} max=${p.max} esperaMs=${JSON.stringify(p.esperaMs)}`);
      }
      console.log('Modo sesión:', JSON.stringify(json.modoSesion));
    }
  }

  // Un 409 en asistencia = "ya estaba registrada" (repetir la prueba). En voto
  // un 409 significa que la votación NO estaba abierta: eso sí es falla.
  const fallas = Object.entries(gRegistro.estados)
    .filter(([s]) => !(Number(s) >= 200 && Number(s) < 300) && !(MODO === 'asistencia' && s === '409'))
    .reduce((t, [, n]) => t + n, 0);
  const p95 = gRegistro.p(0.95);
  const pasa = fallas === 0 && p95 <= META_P95_MS;
  console.log(`\n${pasa ? '✔ PASA' : '✖ FALLA'}: ${fallas} registro(s) con error, p95=${p95}ms (meta ≤ ${META_P95_MS}ms)`);
  if (gRegistro.estados['409'] && MODO === 'voto') console.log('  (409 = la votación no estaba abierta en el servidor: ¿la abriste en el admin?)');
  if (gRegistro.estados['404']) console.log('  (404 = no existe el registro de voto/asistencia de ese diputado para ese punto/agenda)');
  process.exit(pasa ? 0 : 2);
}

(async () => {
  const diputados = await obtenerDiputados();
  if (!diputados.length) salir('No se encontraron diputados para ese punto/agenda');
  console.log(`URL: ${URL_BASE} · modo: ${MODO} · diputados: ${diputados.length}`);
  if (MODO === 'estado') return modoEstado(diputados);
  return modoRegistro(diputados);
})().catch((e) => salir(`${e?.code ? e.code + ' — ' : ''}${e?.message || ''}
${e?.stack || e}`));
