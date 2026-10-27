/**
 * Prueba de sockets: ¿a TODOS los celulares les llega la apertura/cierre?
 *
 * prueba-carga.js mide cuánto tarda en guardarse un voto, pero no abre sockets.
 * Este script conecta N "celulares" a la sala de diputados (igual que el panel
 * web y APP_SPID), corta la conexión a algunos a mitad de la prueba y reporta,
 * por cada evento que dispare el admin, cuántos lo recibieron y en cuánto.
 *
 * No escribe nada en la BD: solo escucha. Se puede correr en cualquier momento.
 *
 * Requisitos: Node 20+. Usa el socket.io-client del frontend (npm install en la
 * raíz del proyecto). Desde la carpeta backend/:
 *
 *   node scripts/prueba-sockets.js --url https://parlamentario.congresoedomex.gob.mx --clientes 75 --cortar 10
 *
 *   Luego, en el admin: abrir asistencia, cerrarla, abrir votación, cerrarla...
 *   Cada evento se reporta al momento. Ctrl+C para terminar y ver el resumen.
 *
 *   --cortar N   a los ~15 s desconecta N clientes y los reconecta 5 s después
 *                (simula un corte de internet). Deben seguir recibiendo todo.
 *   --segundos S termina solo después de S segundos (por defecto: hasta Ctrl+C).
 */
const path = require('path');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const sig = process.argv[i + 1];
  if (sig === undefined || sig.startsWith('--')) args[a.slice(2)] = true;
  else { args[a.slice(2)] = sig; i++; }
}

let io;
try {
  io = require('socket.io-client').io;
} catch {
  try {
    io = require(path.join(__dirname, '..', '..', 'node_modules', 'socket.io-client')).io;
  } catch {
    console.error('\n✖ No se encontró socket.io-client. Corre "npm install" en la raíz del proyecto.\n');
    process.exit(1);
  }
}

const URL_BASE = String(args.url || 'http://localhost:3013').replace(/\/$/, '');
const CLIENTES = Number(args.clientes) || 75;
const CORTAR = Number(args.cortar) || 0;
const SEGUNDOS = Number(args.segundos) || 0;
// Tras el primer aviso de un evento, cuánto se espera a los demás antes de reportarlo.
const VENTANA_MS = 5000;

const EVENTOS = ['asistencia-abierta', 'asistencia-cerrada', 'votacion-abierta', 'votacion-cerrada', 'sesion-iniciada', 'sesion-terminada'];

const clientes = [];
const stats = { conexiones: 0, desconexiones: 0, reconexiones: 0, errores: 0 };
const eventos = [];          // historial para el resumen final
let enCurso = null;          // { nombre, inicio, recibidos: Map<idx, ms> }

function hora() {
  return new Date().toLocaleTimeString('es-MX', { hour12: false });
}

function cerrarEvento() {
  const e = enCurso;
  enCurso = null;
  const tiempos = [...e.recibidos.values()].sort((a, b) => a - b);
  const faltan = clientes.filter((c) => !e.recibidos.has(c.idx));
  const conectadosQueFaltan = faltan.filter((c) => c.socket.connected).length;
  const ok = faltan.length === 0;
  e.ok = ok;
  e.total = e.recibidos.size;
  eventos.push(e);
  console.log(
    `${ok ? '✔' : '✖'} [${hora()}] ${e.nombre.padEnd(18)} recibido por ${e.recibidos.size}/${CLIENTES}` +
    `  · dispersión ${tiempos[tiempos.length - 1]}ms (primero→último)`
  );
  if (!ok) {
    console.log(`    Faltaron ${faltan.length} cliente(s) (${conectadosQueFaltan} conectados sin recibirlo): ${faltan.slice(0, 10).map((c) => '#' + c.idx).join(' ')}${faltan.length > 10 ? ' …' : ''}`);
  }
}

function recibir(c, nombre) {
  const ahora = Date.now();
  if (!enCurso || enCurso.nombre !== nombre) {
    if (enCurso) cerrarEvento();
    enCurso = { nombre, inicio: ahora, recibidos: new Map() };
    setTimeout(() => { if (enCurso && enCurso.inicio === ahora) cerrarEvento(); }, VENTANA_MS);
  }
  if (!enCurso.recibidos.has(c.idx)) enCurso.recibidos.set(c.idx, ahora - enCurso.inicio);
}

function crearCliente(idx) {
  const parsed = new URL(URL_BASE);
  const socket = io(parsed.origin, {
    path: parsed.pathname.replace(/\/$/, '') + '/socket.io',
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 5000,
    forceNew: true,
  });
  const c = { idx, socket, conectadoAntes: false };
  // Igual que las apps: volver a unirse a la sala en CADA conexión.
  socket.on('connect', () => {
    if (c.conectadoAntes) stats.reconexiones++;
    else stats.conexiones++;
    c.conectadoAntes = true;
    socket.emit('unirse-diputado');
  });
  socket.on('disconnect', () => stats.desconexiones++);
  socket.on('connect_error', () => stats.errores++);
  for (const ev of EVENTOS) socket.on(ev, () => recibir(c, ev));
  return c;
}

function resumen() {
  if (enCurso) cerrarEvento();
  const conectados = clientes.filter((c) => c.socket.connected).length;
  console.log('\n──────── Resumen ────────');
  console.log(`Conectados al final: ${conectados}/${CLIENTES} · reconexiones: ${stats.reconexiones} · desconexiones: ${stats.desconexiones} · errores de conexión: ${stats.errores}`);
  if (!eventos.length) {
    console.log('No se recibió ningún evento. ¿Se abrió/cerró asistencia o votación en el admin mientras corría?');
  } else {
    const fallidos = eventos.filter((e) => !e.ok);
    console.log(`Eventos: ${eventos.length} · completos: ${eventos.length - fallidos.length} · incompletos: ${fallidos.length}`);
    console.log(fallidos.length === 0
      ? '\n✔ PASA: todos los clientes recibieron todos los eventos.'
      : '\n✖ FALLA: hubo eventos que no llegaron a todos (ver arriba cuáles y a quiénes).');
  }
  clientes.forEach((c) => c.socket.disconnect());
  process.exit(0);
}

console.log(`URL: ${URL_BASE} · clientes: ${CLIENTES}${CORTAR ? ` · cortes simulados: ${CORTAR}` : ''}`);
console.log('Conectando...');
for (let i = 1; i <= CLIENTES; i++) clientes.push(crearCliente(i));

setTimeout(() => {
  const conectados = clientes.filter((c) => c.socket.connected).length;
  console.log(`${conectados}/${CLIENTES} conectados. Ahora abre/cierra asistencia o votación en el admin. (Ctrl+C para terminar)\n`);
}, 5000);

if (CORTAR) {
  setTimeout(() => {
    const victimas = clientes.slice(0, CORTAR);
    console.log(`[${hora()}] Cortando la conexión a ${victimas.length} cliente(s) por 5 s (simula un corte de internet)...`);
    victimas.forEach((c) => c.socket.disconnect());
    setTimeout(() => {
      victimas.forEach((c) => c.socket.connect());
      console.log(`[${hora()}] Reconectados. Los próximos eventos deben llegarles también.\n`);
    }, 5000);
  }, 15000);
}

if (SEGUNDOS) setTimeout(resumen, SEGUNDOS * 1000);
process.on('SIGINT', resumen);
