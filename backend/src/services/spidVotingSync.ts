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

interface FilaCambio {
  id: number;
  mensaje: string;
  updated_at: string;
  nombre_db: string | null;
}

let checkpointVotos: string | null = null;
let checkpointAsistencias: string | null = null;
let cicloEnCurso = false;

async function obtenerCheckpointInicial(tabla: 'mensajes_votos' | 'asistencia_votos'): Promise<string> {
  const [fila] = await spidConnection.query(
    `SELECT MAX(updated_at) AS maxUpdated FROM ${tabla}`,
    { type: QueryTypes.SELECT }
  ) as any[];
  // Sin historial previo: arranca desde "ahora", nunca desde el epoch — esto
  // es un espejo hacia adelante, no una migración de datos históricos.
  return fila?.maxUpdated ?? new Date(0).toISOString();
}

async function enviarACapturadora(nombre: string, sentido: string) {
  const port = process.env.PORT || 3013;
  await axios.post(`http://localhost:${port}/api/capturadora/voto`, { nombre, sentido });
}

async function procesarVotos() {
  const filas = await spidConnection.query(
    `SELECT m.id, m.mensaje, m.updated_at, d.nombre_db
     FROM mensajes_votos m
     JOIN datos_users d ON d.id = m.id_diputado
     WHERE m.status = 1
       AND m.mensaje IN ('FAVOR', 'CONTRA', 'ABSTENCION')
       AND m.updated_at > :checkpoint
     ORDER BY m.updated_at ASC`,
    { type: QueryTypes.SELECT, replacements: { checkpoint: checkpointVotos } }
  ) as FilaCambio[];

  for (const fila of filas) {
    checkpointVotos = fila.updated_at;
    if (!fila.nombre_db) {
      console.warn(`${LOG_PREFIX} voto id=${fila.id} sin nombre_db en spid, se omite`);
      continue;
    }
    const sentido = MENSAJE_A_SENTIDO[fila.mensaje];
    try {
      await enviarACapturadora(fila.nombre_db, sentido);
      console.log(`${LOG_PREFIX} voto reenviado: "${fila.nombre_db}" -> ${sentido}`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        console.log(`${LOG_PREFIX} voto "${fila.nombre_db}" sin votación abierta en SIRegistroParlamentario (esperado, se ignora)`);
      } else {
        console.error(`${LOG_PREFIX} error reenviando voto de "${fila.nombre_db}":`, err?.message || err);
      }
    }
  }
}

async function procesarAsistencias() {
  const filas = await spidConnection.query(
    `SELECT a.id, a.mensaje, a.updated_at, d.nombre_db
     FROM asistencia_votos a
     JOIN datos_users d ON d.id = a.id_diputado
     WHERE a.status = 1
       AND a.mensaje = 'ASISTENCIA'
       AND a.updated_at > :checkpoint
     ORDER BY a.updated_at ASC`,
    { type: QueryTypes.SELECT, replacements: { checkpoint: checkpointAsistencias } }
  ) as FilaCambio[];

  for (const fila of filas) {
    checkpointAsistencias = fila.updated_at;
    if (!fila.nombre_db) {
      console.warn(`${LOG_PREFIX} asistencia id=${fila.id} sin nombre_db en spid, se omite`);
      continue;
    }
    try {
      // El tablero físico manda siempre ABSTENCION durante la fase de
      // asistencia (el endpoint lo ignora y solo registra presencia) —
      // ver el comentario en routes/capturadora.ts.
      await enviarACapturadora(fila.nombre_db, 'ABSTENCION');
      console.log(`${LOG_PREFIX} asistencia reenviada: "${fila.nombre_db}"`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        console.log(`${LOG_PREFIX} asistencia "${fila.nombre_db}" sin sesión abierta en SIRegistroParlamentario (esperado, se ignora)`);
      } else {
        console.error(`${LOG_PREFIX} error reenviando asistencia de "${fila.nombre_db}":`, err?.message || err);
      }
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
  } catch (err: any) {
    console.error(`${LOG_PREFIX} no se pudo conectar a la BD de spid, sync deshabilitado para esta corrida:`, err?.message || err);
    return;
  }

  const intervalMs = Number(process.env.SPID_SYNC_INTERVAL_MS) || 3000;
  console.log(`${LOG_PREFIX} activo, revisando spid cada ${intervalMs}ms`);
  setInterval(tick, intervalMs);
}
