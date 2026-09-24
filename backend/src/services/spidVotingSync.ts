/**
 * Espejo de contingencia: spid (legado, Laravel, no se toca) sigue siendo
 * donde los diputados registran asistencia/voto. Este poller solo LEE su
 * base MySQL y reenvía cada cambio al webhook existente
 * POST /api/capturadora/voto (routes/capturadora.ts), como si fuera el
 * tablero físico — así se prueba el flujo real de SIRegistroParlamentario en
 * producción sin depender de él ni modificar spid.
 *
 * Opt-in: si SPID_SYNC_ENABLED !== 'true' o faltan credenciales de spid, no
 * se abre ni siquiera la conexión. Cualquier error (spid caído, red, sin
 * match, sin votación abierta en SIRegistroParlamentario) se loguea y el
 * poller sigue en el siguiente tick — nunca debe afectar al resto del backend.
 */
import axios from 'axios';
import { QueryTypes } from 'sequelize';
import spidConnection from '../database/spidConnection';

const LOG_PREFIX = '[spid-sync]';

const MENSAJE_A_SENTIDO: Record<string, 'FAVOR' | 'ABSTENCION' | 'CONTRA'> = {
  FAVOR: 'FAVOR',
  CONTRA: 'CONTRA',
  ABSTENCION: 'ABSTENCION',
};

// updated_at de Laravel es TIMESTAMP con precisión de SEGUNDOS: si varios
// diputados registran en el mismo segundo y el tick lee a la mitad, un
// `updated_at > checkpoint` estricto se salta a los que llegaron después en
// ese mismo segundo. Por eso se relee una ventana hacia atrás y se deduplica.
const VENTANA_RELECTURA_MS = 15 * 1000;

// Una asistencia de spid que llega cuando SIRegistroParlamentario todavía no
// abre la asistencia de la Sesión (o por un error de red) se reintenta cada
// tick hasta que entre — antes se perdía para siempre. Pasado este tiempo se
// descarta (ya no es la misma sesión).
const REINTENTO_ASISTENCIA_MAX_MS = 4 * 60 * 60 * 1000;

const TIMEOUT_HTTP_MS = 10 * 1000;

interface FilaCambio {
  id: number;
  mensaje: string;
  updated_at: Date | string;
  nombre_db: string | null;
}

let checkpointVotos: Date = new Date();
let checkpointAsistencias: Date = new Date();
// Lo que ya existía al arrancar no se reenvía aunque caiga en la ventana.
let pisoVotos: Date = new Date();
let pisoAsistencias: Date = new Date();
let cicloEnCurso = false;

// clave (id|updated_at|mensaje) -> ms de updated_at, para no reenviar lo
// que la ventana de relectura vuelve a traer.
const votosVistos = new Map<string, number>();
const asistenciasVistas = new Map<string, number>();

// nombre_db -> primera vez que se vio pendiente
const asistenciasPendientes = new Map<string, number>();
// nombres sin nombre_captura en SIRegistroParlamentario: se avisa una sola vez
const nombresSinMatchAvisados = new Set<string>();

async function obtenerCheckpointInicial(tabla: 'mensajes_votos' | 'asistencia_votos'): Promise<Date> {
  const [fila] = await spidConnection.query(
    `SELECT MAX(updated_at) AS maxUpdated FROM ${tabla}`,
    { type: QueryTypes.SELECT }
  ) as any[];
  // Sin historial previo: arranca desde "ahora", nunca desde el epoch — esto
  // es un espejo hacia adelante, no una migración de datos históricos.
  return fila?.maxUpdated ? new Date(fila.maxUpdated) : new Date();
}

type ResultadoEnvio = 'OK' | 'SIN_DIPUTADO' | 'SIN_EVENTO_ABIERTO' | 'SIN_REGISTRO' | 'ERROR';

async function enviarACapturadora(nombre: string, sentido: string, tipo?: 'ASISTENCIA'): Promise<{ resultado: ResultadoEnvio; detalle?: string }> {
  const port = process.env.PORT || 3013;
  try {
    await axios.post(
      `http://localhost:${port}/api/capturadora/voto`,
      { nombre, sentido, tipo },
      { timeout: TIMEOUT_HTTP_MS }
    );
    return { resultado: 'OK' };
  } catch (err: any) {
    const codigo = err?.response?.data?.codigo;
    if (err?.response?.status === 404 && codigo) {
      return { resultado: codigo };
    }
    return { resultado: 'ERROR', detalle: err?.response?.data?.msg || err?.message || String(err) };
  }
}

function avisarSinMatch(nombre: string) {
  if (nombresSinMatchAvisados.has(nombre)) return;
  nombresSinMatchAvisados.add(nombre);
  console.warn(`${LOG_PREFIX} "${nombre}" no coincide con ningún diputados.nombre_captura en SIRegistroParlamentario — corrige nombre_captura de ese diputado`);
}

/** Lee filas nuevas (con ventana de relectura) y devuelve solo las no vistas. */
async function leerCambios(
  sql: string,
  checkpoint: Date,
  piso: Date,
  vistos: Map<string, number>
): Promise<{ nuevas: FilaCambio[]; nuevoCheckpoint: Date }> {
  const desde = new Date(checkpoint.getTime() - VENTANA_RELECTURA_MS);
  const filas = await spidConnection.query(sql, {
    type: QueryTypes.SELECT,
    replacements: { desde },
  }) as FilaCambio[];

  let nuevoCheckpoint = checkpoint;
  const nuevas: FilaCambio[] = [];
  for (const fila of filas) {
    const ts = new Date(fila.updated_at);
    if (ts > nuevoCheckpoint) nuevoCheckpoint = ts;
    if (ts <= piso) continue;
    const clave = `${fila.id}|${ts.getTime()}|${fila.mensaje}`;
    if (vistos.has(clave)) continue;
    vistos.set(clave, ts.getTime());
    nuevas.push(fila);
  }

  // Lo que ya quedó fuera de la ventana no puede volver a leerse.
  const limite = nuevoCheckpoint.getTime() - VENTANA_RELECTURA_MS * 2;
  for (const [clave, ms] of vistos) {
    if (ms < limite) vistos.delete(clave);
  }
  return { nuevas, nuevoCheckpoint };
}

async function procesarVotos() {
  const { nuevas, nuevoCheckpoint } = await leerCambios(
    `SELECT m.id, m.mensaje, m.updated_at, d.nombre_db
     FROM mensajes_votos m
     JOIN datos_users d ON d.id = m.id_diputado
     WHERE m.status = 1
       AND m.mensaje IN ('FAVOR', 'CONTRA', 'ABSTENCION')
       AND m.updated_at >= :desde
     ORDER BY m.updated_at ASC`,
    checkpointVotos,
    pisoVotos,
    votosVistos
  );
  checkpointVotos = nuevoCheckpoint;

  // Los votos NO se reintentan: si se reenvían más tarde podrían caer en otro
  // punto que SIRegistroParlamentario haya abierto para entonces.
  for (const fila of nuevas) {
    if (!fila.nombre_db) {
      console.warn(`${LOG_PREFIX} voto id=${fila.id} sin nombre_db en spid, se omite`);
      continue;
    }
    const sentido = MENSAJE_A_SENTIDO[fila.mensaje];
    const { resultado, detalle } = await enviarACapturadora(fila.nombre_db, sentido);
    switch (resultado) {
      case 'OK':
        console.log(`${LOG_PREFIX} voto reenviado: "${fila.nombre_db}" -> ${sentido}`);
        break;
      case 'SIN_DIPUTADO':
        avisarSinMatch(fila.nombre_db);
        break;
      case 'SIN_EVENTO_ABIERTO':
        console.log(`${LOG_PREFIX} voto "${fila.nombre_db}" sin votación abierta en SIRegistroParlamentario, se ignora`);
        break;
      case 'SIN_REGISTRO':
        console.warn(`${LOG_PREFIX} voto "${fila.nombre_db}": no existe su registro de voto en el punto abierto`);
        break;
      default:
        console.error(`${LOG_PREFIX} error reenviando voto de "${fila.nombre_db}": ${detalle}`);
    }
  }
}

async function procesarAsistencias() {
  const { nuevas, nuevoCheckpoint } = await leerCambios(
    `SELECT a.id, a.mensaje, a.updated_at, d.nombre_db
     FROM asistencia_votos a
     JOIN datos_users d ON d.id = a.id_diputado
     WHERE a.status = 1
       AND a.mensaje = 'ASISTENCIA'
       AND a.updated_at >= :desde
     ORDER BY a.updated_at ASC`,
    checkpointAsistencias,
    pisoAsistencias,
    asistenciasVistas
  );
  checkpointAsistencias = nuevoCheckpoint;

  const ahora = Date.now();
  for (const fila of nuevas) {
    if (!fila.nombre_db) {
      console.warn(`${LOG_PREFIX} asistencia id=${fila.id} sin nombre_db en spid, se omite`);
      continue;
    }
    if (!asistenciasPendientes.has(fila.nombre_db)) {
      asistenciasPendientes.set(fila.nombre_db, ahora);
    }
  }

  // Cada nombre es independiente: uno sin match o con error no detiene al resto.
  for (const [nombre, desde] of Array.from(asistenciasPendientes.entries())) {
    // tipo=ASISTENCIA: aunque haya una votación abierta, nunca se registra
    // como voto de abstención.
    const { resultado, detalle } = await enviarACapturadora(nombre, 'ABSTENCION', 'ASISTENCIA');
    switch (resultado) {
      case 'OK':
        asistenciasPendientes.delete(nombre);
        console.log(`${LOG_PREFIX} asistencia reenviada: "${nombre}"`);
        continue;
      case 'SIN_DIPUTADO':
        asistenciasPendientes.delete(nombre);
        avisarSinMatch(nombre);
        continue;
      case 'SIN_REGISTRO':
        asistenciasPendientes.delete(nombre);
        console.warn(`${LOG_PREFIX} asistencia "${nombre}": no existe su registro en la asistencia abierta`);
        continue;
      case 'ERROR':
        console.error(`${LOG_PREFIX} error reenviando asistencia de "${nombre}" (se reintenta): ${detalle}`);
        break;
      // SIN_EVENTO_ABIERTO: SIRegistroParlamentario aún no abre la asistencia — se reintenta.
    }
    if (ahora - desde > REINTENTO_ASISTENCIA_MAX_MS) {
      asistenciasPendientes.delete(nombre);
      console.warn(`${LOG_PREFIX} asistencia "${nombre}" descartada tras ${REINTENTO_ASISTENCIA_MAX_MS / 3600000}h sin sesión abierta`);
    }
  }
}

async function tick() {
  if (cicloEnCurso) return;
  cicloEnCurso = true;
  try {
    await procesarVotos();
    await procesarAsistencias();
  } catch (err: any) {
    console.error(`${LOG_PREFIX} error en el ciclo de sincronización:`, err?.message || err);
  } finally {
    cicloEnCurso = false;
  }
}

export async function startSpidVotingSync() {
  if (process.env.SPID_SYNC_ENABLED !== 'true') {
    return;
  }
  if (!process.env.DB_HOST_SPID || !process.env.DB_USER_SPID) {
    console.error(`${LOG_PREFIX} SPID_SYNC_ENABLED=true pero faltan DB_HOST_SPID/DB_USER_SPID — no se inicia el sync.`);
    return;
  }

  try {
    checkpointVotos = await obtenerCheckpointInicial('mensajes_votos');
    checkpointAsistencias = await obtenerCheckpointInicial('asistencia_votos');
    pisoVotos = checkpointVotos;
    pisoAsistencias = checkpointAsistencias;
  } catch (err: any) {
    console.error(`${LOG_PREFIX} no se pudo conectar a la BD de spid, sync deshabilitado para esta corrida:`, err?.message || err);
    return;
  }

  const intervalMs = Number(process.env.SPID_SYNC_INTERVAL_MS) || 3000;
  console.log(`${LOG_PREFIX} activo, revisando spid cada ${intervalMs}ms`);
  setInterval(tick, intervalMs);
}
