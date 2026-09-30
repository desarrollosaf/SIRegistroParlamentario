import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import Diputado from '../models/diputado';
import VotosPunto from '../models/votos_punto';
import AsistenciaVoto from '../models/asistencia_votos';
import Agenda from '../models/agendas';
import TipoEventos from '../models/tipo_eventos';

const router = Router();

export function normalizar(valor: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SENTIDO_POR_TEXTO: Record<string, { codigo: number; mensaje: string }> = {
  FAVOR: { codigo: 1, mensaje: 'A favor' },
  ABSTENCION: { codigo: 2, mensaje: 'Abstención' },
  CONTRA: { codigo: 3, mensaje: 'En contra' },
};

// La capturadora manda una petición por cada diputado detectado (~75 casi de
// golpe cuando abre una votación) — sin caché, cada una repetía un
// Diputado.findAll() completo. nombre_captura casi no cambia (se pobló una
// sola vez), así que basta refrescar cada pocos minutos en vez de por voto.
const CACHE_DIPUTADOS_TTL_MS = 5 * 60 * 1000;
let cacheDiputadosCaptura: { data: any[]; expiraEn: number } | null = null;
// Si llegan varias peticiones en paralelo con el caché vencido (el espejo de
// spid registra en tandas), comparten una sola consulta en vez de N findAll.
let cargaDiputadosEnCurso: Promise<any[]> | null = null;

export async function obtenerDiputadosConNombreCaptura(): Promise<any[]> {
  const ahora = Date.now();
  if (cacheDiputadosCaptura && cacheDiputadosCaptura.expiraEn > ahora) {
    return cacheDiputadosCaptura.data;
  }
  if (!cargaDiputadosEnCurso) {
    cargaDiputadosEnCurso = Diputado.findAll({ where: { nombre_captura: { [Op.ne]: null } } as any })
      .then(
        (data) => {
          cacheDiputadosCaptura = { data, expiraEn: Date.now() + CACHE_DIPUTADOS_TTL_MS };
          cargaDiputadosEnCurso = null;
          return data;
        },
        (err) => {
          cargaDiputadosEnCurso = null;
          throw err;
        }
      );
  }
  return cargaDiputadosEnCurso;
}

/** Busca en un mapa de eventos abiertos (votacionesAbiertas/asistenciasAbiertas)
 *  cuál corresponde a una Sesión. `esSesion` se guarda al abrir (models/server.ts),
 *  así que normalmente no toca la BD; solo consulta la agenda de las entradas
 *  donde no se pudo resolver (undefined), una vez por idAgenda. */
export async function buscarAbiertaDeSesion(mapa: Map<string, any>): Promise<{ idComision: string; estado: any } | null> {
  const sinResolver = new Map<string, boolean>();
  for (const [idComision, estado] of mapa.entries()) {
    let esSesion: boolean | undefined = estado.esSesion;
    if (esSesion === undefined) {
      if (!sinResolver.has(estado.idAgenda)) {
        const agenda = await Agenda.findByPk(estado.idAgenda, {
          attributes: ['id'],
          include: [{ model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] }],
        });
        sinResolver.set(estado.idAgenda, (agenda as any)?.tipoevento?.nombre === 'Sesión');
      }
      esSesion = sinResolver.get(estado.idAgenda);
    }
    if (esSesion) return { idComision, estado };
  }
  return null;
}

/**
 * Webhook (público, sin JWT — igual que /api/transcripcion/linea): la
 * capturadora del Pleno manda aquí cada voto detectado por color en el
 * tablero físico. Reemplaza al viejo spid.local/api/votoDipNom.
 *
 * Body: { nombre: string, sentido: "FAVOR" | "ABSTENCION" | "CONTRA", tipo?: "ASISTENCIA" }
 *
 * tipo="ASISTENCIA" (lo manda services/spidVotingSync.ts) fuerza el camino de
 * asistencia: nunca se registra como voto aunque haya una votación abierta.
 * Los 404 traen `codigo` (SIN_DIPUTADO | SIN_EVENTO_ABIERTO | SIN_REGISTRO)
 * para que quien llama distinga "no existe el nombre" de "todavía no abren".
 *
 * El "nombre" se matchea EXACTO (normalizado) contra diputados.nombre_captura
 * — poblado una sola vez desde el nombre_db del sistema viejo (ver
 * scripts/capturadora/cruzar-nombres-spid.ts), no es fuzzy-match en vivo.
 *
 * tipo="VOTO" (lo manda services/spidVotingSync.ts) es lo contrario: solo el
 * camino de votación. Si no hay votación abierta responde SIN_EVENTO_ABIERTO
 * en vez de tomarlo como asistencia, para que el espejo lo reintente.
 */
export interface ResultadoCapturadora {
  status: number;
  body: { codigo?: string; msg: string; error?: string };
}

/** Lógica del webhook sin HTTP, para que services/spidVotingSync.ts registre
 *  directo en vez de llamarse a sí mismo por localhost. `app` es la app de
 *  Express (de ahí salen votacionesAbiertas, asistenciasAbiertas e io). */
export async function registrarDesdeCapturadora(
  app: { get(nombre: string): any },
  datos: { nombre?: any; sentido?: any; tipo?: any }
): Promise<ResultadoCapturadora> {
  try {
    const { nombre, sentido, tipo } = datos || {};
    const tipoNormalizado = String(tipo || '').toUpperCase();
    const soloAsistencia = tipoNormalizado === 'ASISTENCIA';
    const soloVoto = tipoNormalizado === 'VOTO';
    if (!nombre || !sentido) {
      return { status: 400, body: { msg: 'Faltan nombre y/o sentido' } };
    }

    const sentidoInfo = SENTIDO_POR_TEXTO[String(sentido).toUpperCase()];
    if (!sentidoInfo) {
      return { status: 400, body: { msg: 'sentido inválido. Usa FAVOR, ABSTENCION o CONTRA' } };
    }

    const nombreNormalizado = normalizar(nombre);
    const candidatos = await obtenerDiputadosConNombreCaptura();
    const diputado = (candidatos as any[]).find((d) => normalizar(d.nombre_captura) === nombreNormalizado) || null;

    if (!diputado) {
      return { status: 404, body: { codigo: 'SIN_DIPUTADO', msg: `No se encontró ningún diputado con nombre_captura = "${nombre}"` } };
    }

    const votacionesAbiertas: Map<string, any> = app.get('votacionesAbiertas') || new Map();

    const sesionVotando = soloAsistencia ? null : await buscarAbiertaDeSesion(votacionesAbiertas);
    const idComisionSesion = sesionVotando?.idComision ?? null;
    const votAbierta = sesionVotando?.estado ?? null;

    if (!votAbierta && soloVoto) {
      return { status: 404, body: { codigo: 'SIN_EVENTO_ABIERTO', msg: 'No hay ninguna votación de Sesión abierta actualmente' } };
    }

    if (!votAbierta) {
      // No hay votación abierta: puede que el tablero esté en fase de ASISTENCIA.
      // La capturadora no distingue el modo — durante asistencia manda siempre
      // sentido=ABSTENCION sin importar el color real, así que cualquier señal
      // de un diputado en esta fase significa simplemente "está presente".
      const asistenciasAbiertas: Map<string, any> = app.get('asistenciasAbiertas') || new Map();

      const sesionAsistiendo = await buscarAbiertaDeSesion(asistenciasAbiertas);
      const idComisionSesionAsist = sesionAsistiendo?.idComision ?? null;
      const asistAbierta = sesionAsistiendo?.estado ?? null;

      if (!asistAbierta) {
        return { status: 404, body: { codigo: 'SIN_EVENTO_ABIERTO', msg: 'No hay ninguna votación ni asistencia de Sesión abierta actualmente' } };
      }

      const asistenciaRegistro = await AsistenciaVoto.findOne({
        where: { id_diputado: (diputado as any).id, id_agenda: asistAbierta.idAgenda },
      });
      if (!asistenciaRegistro) {
        return { status: 404, body: { codigo: 'SIN_REGISTRO', msg: 'No se encontró el registro de asistencia para este diputado' } };
      }
      if ((asistenciaRegistro as any).sentido_voto !== 0) {
        return { status: 200, body: { msg: 'Este diputado ya tenía asistencia registrada' } };
      }

      await (asistenciaRegistro as any).update({ sentido_voto: 1, mensaje: 'ASISTENCIA' });

      const ioAsist = app.get('io');
      // La sala de proyección usa el SAF id (safId), no el UUID interno que es la
      // clave del mapa — igual que hace registrarAsistencia en diputado.ts.
      const roomIdAsist = asistAbierta.safId || idComisionSesionAsist || (asistenciaRegistro as any).comision_dip_id;
      if (ioAsist && roomIdAsist) {
        ioAsist.to(`proyeccion-${roomIdAsist}`).emit('asistencia-registrada', {
          id_diputado: (diputado as any).id,
          id_agenda: asistAbierta.idAgenda,
          sentido: 1,
        });
      }

      return { status: 200, body: { msg: 'Asistencia registrada correctamente' } };
    }

    const whereVoto: any = { id_diputado: (diputado as any).id };
    if (votAbierta.idReserva) {
      whereVoto.id_tema_punto_voto = votAbierta.idReserva;
    } else if (votAbierta.idPunto && votAbierta.idIniciativa) {
      whereVoto.id_punto = votAbierta.idPunto;
      whereVoto.id_iniciativa = votAbierta.idIniciativa;
    } else if (votAbierta.idPunto) {
      whereVoto.id_punto = votAbierta.idPunto;
      whereVoto.id_iniciativa = null;
    }

    const votoRegistro = await VotosPunto.findOne({ where: whereVoto });
    if (!votoRegistro) {
      return { status: 404, body: { codigo: 'SIN_REGISTRO', msg: 'No se encontró el registro de votación para este diputado en el punto abierto' } };
    }

    await (votoRegistro as any).update({ sentido: sentidoInfo.codigo, mensaje: sentidoInfo.mensaje });

    const io = app.get('io');
    // La sala de proyección usa el SAF id (safId), no el UUID interno que es la
    // clave del mapa — igual que hace registrarVoto en diputado.ts.
    const roomId = votAbierta.safId || idComisionSesion || (votoRegistro as any).id_comision_dip;
    if (io && roomId) {
      io.to(`proyeccion-${roomId}`).emit('voto-registrado', {
        id_diputado: (diputado as any).id,
        sentido_voto: sentidoInfo.codigo,
        id: (votoRegistro as any).id,
      });
    }

    return { status: 200, body: { msg: 'Voto registrado correctamente' } };
  } catch (error: any) {
    console.error('[capturadora/voto]', error?.message || error);
    return { status: 500, body: { msg: 'Error interno del servidor', error: error?.message } };
  }
}

router.post('/api/capturadora/voto', async (req: Request, res: Response): Promise<any> => {
  const { status, body } = await registrarDesdeCapturadora(req.app, req.body);
  return res.status(status).json(body);
});

export default router;
