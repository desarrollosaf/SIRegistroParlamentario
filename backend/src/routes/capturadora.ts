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

/**
 * Webhook (público, sin JWT — igual que /api/transcripcion/linea): la
 * capturadora del Pleno manda aquí cada voto detectado por color en el
 * tablero físico. Reemplaza al viejo spid.local/api/votoDipNom.
 *
 * Body: { nombre: string, sentido: "FAVOR" | "ABSTENCION" | "CONTRA" }
 *
 * El "nombre" se matchea EXACTO (normalizado) contra diputados.nombre_captura
 * — poblado una sola vez desde el nombre_db del sistema viejo (ver
 * scripts/capturadora/cruzar-nombres-spid.ts), no es fuzzy-match en vivo.
 */
router.post('/api/capturadora/voto', async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, sentido } = req.body || {};
    if (!nombre || !sentido) {
      return res.status(400).json({ msg: 'Faltan nombre y/o sentido' });
    }

    const sentidoInfo = SENTIDO_POR_TEXTO[String(sentido).toUpperCase()];
    if (!sentidoInfo) {
      return res.status(400).json({ msg: 'sentido inválido. Usa FAVOR, ABSTENCION o CONTRA' });
    }

    const nombreNormalizado = normalizar(nombre);
    const candidatos = await Diputado.findAll({ where: { nombre_captura: { [Op.ne]: null } } as any });
    const diputado = (candidatos as any[]).find((d) => normalizar(d.nombre_captura) === nombreNormalizado) || null;

    if (!diputado) {
      return res.status(404).json({ msg: `No se encontró ningún diputado con nombre_captura = "${nombre}"` });
    }

    const votacionesAbiertas: Map<string, any> = req.app.get('votacionesAbiertas') || new Map();

    let idComisionSesion: string | null = null;
    let votAbierta: any = null;
    for (const [idComision, estado] of votacionesAbiertas.entries()) {
      const agenda = await Agenda.findByPk(estado.idAgenda, {
        include: [{ model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] }],
      });
      if ((agenda as any)?.tipoevento?.nombre === 'Sesión') {
        idComisionSesion = idComision;
        votAbierta = estado;
        break;
      }
    }

    if (!votAbierta) {
      // No hay votación abierta: puede que el tablero esté en fase de ASISTENCIA.
      // La capturadora no distingue el modo — durante asistencia manda siempre
      // sentido=ABSTENCION sin importar el color real, así que cualquier señal
      // de un diputado en esta fase significa simplemente "está presente".
      const asistenciasAbiertas: Map<string, any> = req.app.get('asistenciasAbiertas') || new Map();

      let idComisionSesionAsist: string | null = null;
      let asistAbierta: any = null;
      for (const [idComision, estado] of asistenciasAbiertas.entries()) {
        const agenda = await Agenda.findByPk(estado.idAgenda, {
          include: [{ model: TipoEventos, as: 'tipoevento', attributes: ['nombre'] }],
        });
        if ((agenda as any)?.tipoevento?.nombre === 'Sesión') {
          idComisionSesionAsist = idComision;
          asistAbierta = estado;
          break;
        }
      }

      if (!asistAbierta) {
        return res.status(404).json({ msg: 'No hay ninguna votación ni asistencia de Sesión abierta actualmente' });
      }

      const asistenciaRegistro = await AsistenciaVoto.findOne({
        where: { id_diputado: (diputado as any).id, id_agenda: asistAbierta.idAgenda },
      });
      if (!asistenciaRegistro) {
        return res.status(404).json({ msg: 'No se encontró el registro de asistencia para este diputado' });
      }
      if ((asistenciaRegistro as any).sentido_voto !== 0) {
        return res.status(200).json({ msg: 'Este diputado ya tenía asistencia registrada' });
      }

      await (asistenciaRegistro as any).update({ sentido_voto: 1, mensaje: 'ASISTENCIA' });

      const ioAsist = req.app.get('io');
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

      return res.status(200).json({ msg: 'Asistencia registrada correctamente' });
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
      return res.status(404).json({ msg: 'No se encontró el registro de votación para este diputado en el punto abierto' });
    }

    await (votoRegistro as any).update({ sentido: sentidoInfo.codigo, mensaje: sentidoInfo.mensaje });

    const io = req.app.get('io');
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

    return res.status(200).json({ msg: 'Voto registrado correctamente' });
  } catch (error: any) {
    console.error('[capturadora/voto]', error?.message || error);
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
});

export default router;
