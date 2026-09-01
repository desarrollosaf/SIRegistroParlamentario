import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import Diputado from '../models/diputado';
import Agenda from '../models/agendas';
import TipoEventos from '../models/tipo_eventos';
import { normalizar } from './capturadora';
import { registrarAsistenciaCore, registrarVotoCore, obtenerEstadoPanel, obtenerMisVotos, getOrdenDelDia } from '../controllers/diputado';

const router = Router();

/** Encuentra la entrada de tipo Sesión dentro de un mapa de asistencias/votaciones abiertas. */
async function buscarSesionAbierta(mapa: Map<string, any>): Promise<{ idComision: string; estado: any } | null> {
  for (const [idComision, estado] of mapa.entries()) {
    const agenda = await Agenda.findByPk(estado.idAgenda, {
      include: [{ model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] }],
    });
    if ((agenda as any)?.tipoevento?.nombre === 'Sesión') {
      return { idComision, estado };
    }
  }
  return null;
}

/**
 * Webhook (público, solo red local — igual que /api/capturadora/voto) del
 * programa de reconocimiento facial: avisa qué diputado está sentado frente
 * a una pantalla del Pleno. Le notifica a esa pantalla por socket quién es,
 * y si hay asistencia de Sesión abierta y el diputado no la había
 * registrado, la marca automáticamente (sin que nadie presione nada).
 *
 * Body: { idPantalla: string, nombre: string }
 * El "nombre" se matchea igual que en la capturadora: contra
 * diputados.nombre_captura, exacto y normalizado.
 */
router.post('/api/pleno/identidad', async (req: Request, res: Response): Promise<any> => {
  try {
    const { idPantalla, nombre } = req.body || {};
    if (!idPantalla || !nombre) {
      return res.status(400).json({ msg: 'Faltan idPantalla y/o nombre' });
    }

    const nombreNormalizado = normalizar(nombre);
    const candidatos = await Diputado.findAll({ where: { nombre_captura: { [Op.ne]: null } } as any });
    const diputado = (candidatos as any[]).find((d) => normalizar((d as any).nombre_captura) === nombreNormalizado) || null;

    if (!diputado) {
      return res.status(404).json({ msg: `No se encontró ningún diputado con nombre_captura = "${nombre}"` });
    }

    const diputadoId = (diputado as any).id;
    const nombreCompleto = `${(diputado as any).apaterno ?? ''} ${(diputado as any).amaterno ?? ''} ${(diputado as any).nombres ?? ''}`.trim();

    // Asistencia automática: si hay una Sesión con asistencia abierta y este
    // diputado todavía no la registraba, se marca presente sin intervención.
    const asistenciasAbiertas: Map<string, any> = req.app.get('asistenciasAbiertas') || new Map();
    const sesionAsist = await buscarSesionAbierta(asistenciasAbiertas);
    if (sesionAsist) {
      // Se ignora el resultado a propósito: si ya estaba registrada o no
      // aplica, no es un error para este flujo — solo importa intentarlo.
      await registrarAsistenciaCore(diputadoId, { id_agenda: sesionAsist.estado.idAgenda }, req).catch(() => null);
    }

    const io = req.app.get('io');
    io?.to(`pantalla-${idPantalla}`).emit('identidad-detectada', {
      diputado_id: diputadoId,
      nombre: nombreCompleto,
      alias: (diputado as any).alias || null,
    });

    return res.status(200).json({ msg: 'Identidad procesada', diputado_id: diputadoId, nombre: nombreCompleto });
  } catch (error: any) {
    console.error('[pleno/identidad]', error?.message || error);
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

/**
 * Cuando el reconocimiento facial deja de detectar a alguien frente a una
 * pantalla (se levantó / cambió de lugar), regresa esa pantalla a espera.
 * Body: { idPantalla: string }
 */
router.post('/api/pleno/sin-identidad', async (req: Request, res: Response): Promise<any> => {
  try {
    const { idPantalla } = req.body || {};
    if (!idPantalla) return res.status(400).json({ msg: 'Falta idPantalla' });
    const io = req.app.get('io');
    io?.to(`pantalla-${idPantalla}`).emit('identidad-perdida');
    return res.status(200).json({ msg: 'ok' });
  } catch (error: any) {
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

/**
 * La pantalla de pleno registra el voto del diputado que tiene enfrente.
 * Sin JWT: el diputado_id ya lo resolvió esa misma pantalla vía /identidad.
 * Body: { diputado_id, sentido_voto, id_voto_punto?, id_comision? }
 */
router.post('/api/pleno/voto', async (req: Request, res: Response): Promise<any> => {
  try {
    const { diputado_id } = req.body || {};
    if (!diputado_id) return res.status(400).json({ msg: 'diputado_id es requerido' });
    const { status, body } = await registrarVotoCore(diputado_id, req.body, req);
    return res.status(status).json(body);
  } catch (error: any) {
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

/**
 * Confirmación manual de asistencia desde la pantalla de pleno (respaldo,
 * por si la automática de /identidad no aplicó todavía).
 * Body: { diputado_id, id_agenda, id_comision? }
 */
router.post('/api/pleno/asistencia', async (req: Request, res: Response): Promise<any> => {
  try {
    const { diputado_id } = req.body || {};
    if (!diputado_id) return res.status(400).json({ msg: 'diputado_id es requerido' });
    const { status, body } = await registrarAsistenciaCore(diputado_id, req.body, req);
    return res.status(status).json(body);
  } catch (error: any) {
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

/**
 * Estado actual (asistencia/votación abiertas + si ya registró) para un
 * diputado específico — la pantalla lo pide justo después de identidad-detectada.
 */
router.get('/api/pleno/estado/:diputado_id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { diputado_id } = req.params;
    const filtroAgenda = req.query.idAgenda as string | undefined;
    const estado = await obtenerEstadoPanel(diputado_id, filtroAgenda, req);
    return res.json(estado);
  } catch (error: any) {
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

// Orden del día de la sesión — no depende del diputado, se reutiliza tal cual.
router.get('/api/pleno/orden-del-dia/:idAgenda', getOrdenDelDia);

/** Votos del diputado (ya identificado) para los puntos de una sesión. */
router.get('/api/pleno/mis-votos/:diputado_id/:idAgenda', async (req: Request, res: Response): Promise<any> => {
  try {
    const { diputado_id, idAgenda } = req.params;
    const votos = await obtenerMisVotos(diputado_id, idAgenda);
    return res.json({ votos });
  } catch (error: any) {
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

export default router;
