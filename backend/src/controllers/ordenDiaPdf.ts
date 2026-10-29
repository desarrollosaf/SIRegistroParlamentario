import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../database/registrocomisiones";
import Agenda from "../models/agendas";
import PuntosOrden from "../models/puntos_ordens";
import VotosPunto from "../models/votos_punto";
import TemasPuntosVotos from "../models/temas_puntos_votos";
import Intervencion from "../models/intervenciones";
import IniciativaPuntoOrden from "../models/inciativas_puntos_ordens";
import PuntosComisiones from "../models/puntos_comisiones";
import PuntosPresenta from "../models/puntos_presenta";
import IniciativaEstudio from "../models/iniciativas_estudio";
import { extraerPuntosOrdenDelDia } from "../utils/ordenDelDiaPdf";

/**
 * Qué le impide a un punto ser reemplazado al volver a subir el PDF: cualquier
 * cosa que ya se trabajó sobre él (votación, reservas, intervenciones,
 * iniciativas, turnos, quién presenta, dictámenes o un documento adjunto).
 * Devuelve nopunto → motivos.
 */
async function puntosConActividad(puntos: PuntosOrden[]): Promise<Map<number, string[]>> {
  const ids = puntos.map(p => p.id);
  const resultado = new Map<number, string[]>();
  if (!ids.length) return resultado;

  const porId = new Map<string, PuntosOrden>(puntos.map(p => [String(p.id), p]));
  const marcar = (idPunto: any, motivo: string) => {
    const p = porId.get(String(idPunto));
    if (!p) return;
    const clave = p.nopunto ?? 0;
    const motivos = resultado.get(clave) ?? [];
    if (!motivos.includes(motivo)) motivos.push(motivo);
    resultado.set(clave, motivos);
  };

  const enIds = { [Op.in]: ids };
  const [votos, reservas, intervenciones, iniciativas, turnos, presentan, estudios, dictaminados] = await Promise.all([
    VotosPunto.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    TemasPuntosVotos.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    Intervencion.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    IniciativaPuntoOrden.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    PuntosComisiones.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    PuntosPresenta.findAll({ attributes: ['id_punto'], where: { id_punto: enIds }, group: ['id_punto'], raw: true }),
    IniciativaEstudio.findAll({
      attributes: ['punto_origen_id', 'punto_destino_id'],
      where: { [Op.or]: [{ punto_origen_id: enIds }, { punto_destino_id: enIds }] },
      raw: true,
    }),
    PuntosOrden.findAll({ attributes: ['id_dictamen'], where: { id_dictamen: enIds }, raw: true }),
  ]);

  votos.forEach((r: any) => marcar(r.id_punto, 'votación'));
  reservas.forEach((r: any) => marcar(r.id_punto, 'reservas'));
  intervenciones.forEach((r: any) => marcar(r.id_punto, 'intervenciones'));
  iniciativas.forEach((r: any) => marcar(r.id_punto, 'iniciativas'));
  turnos.forEach((r: any) => marcar(r.id_punto, 'turno a comisión'));
  presentan.forEach((r: any) => marcar(r.id_punto, 'quién presenta'));
  estudios.forEach((r: any) => { marcar(r.punto_origen_id, 'estudio/dictamen'); marcar(r.punto_destino_id, 'estudio/dictamen'); });
  dictaminados.forEach((r: any) => marcar(r.id_dictamen, 'estudio/dictamen'));
  puntos.forEach(p => {
    if (p.path_doc) marcar(p.id, 'documento adjunto');
    if (p.id_dictamen) marcar(p.id, 'estudio/dictamen');
  });

  return resultado;
}

/**
 * POST /api/eventos/importar-orden-dia/:id   (multipart, campo "documento" = PDF)
 *   ?soloVista=1 → solo lee el PDF y regresa los puntos encontrados (no guarda).
 *   sin soloVista → borra los puntos actuales del evento y crea los del PDF,
 *                   SOLO si ninguno de los actuales tiene actividad (409 si sí).
 */
export const importarOrdenDia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const soloVista = req.query.soloVista === '1' || req.query.soloVista === 'true';
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: 'Adjunta el PDF del orden del día.' });
    }

    const evento = await Agenda.findOne({ where: { id } });
    if (!evento) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    let extraidos;
    try {
      extraidos = await extraerPuntosOrdenDelDia(file.buffer);
    } catch {
      return res.status(400).json({ msg: 'No se pudo leer el PDF. Verifica que no esté dañado ni sea una imagen escaneada.' });
    }
    if (!extraidos.length) {
      return res.status(400).json({ msg: 'No se encontraron puntos numerados (1.-, 2.-, …) en el PDF. Si es un escaneo, no tiene texto que leer.' });
    }

    const actuales = await PuntosOrden.findAll({ where: { id_evento: evento.id }, order: [['nopunto', 'ASC']] });
    const conActividad = await puntosConActividad(actuales);
    const bloqueados = [...conActividad.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([nopunto, motivos]) => ({ nopunto, motivos }));

    if (soloVista) {
      return res.status(200).json({
        puntos: extraidos,
        puntosActuales: actuales.length,
        bloqueados,
      });
    }

    if (bloqueados.length) {
      return res.status(409).json({
        msg: 'No se puede reemplazar el orden del día: hay puntos que ya tienen actividad.',
        bloqueados,
      });
    }

    await sequelize.transaction(async (t) => {
      await PuntosOrden.destroy({ where: { id_evento: evento.id }, transaction: t });
      await PuntosOrden.bulkCreate(
        extraidos.map(p => ({ id_evento: evento.id, nopunto: p.nopunto, punto: p.punto })),
        { transaction: t }
      );
    });

    return res.status(200).json({
      msg: `Orden del día cargado: ${extraidos.length} puntos.`,
      creados: extraidos.length,
      reemplazados: actuales.length,
    });
  } catch (error: any) {
    console.error('Error al importar el orden del día:', error);
    return res.status(500).json({ msg: 'Error interno del servidor', error: error?.message });
  }
};
