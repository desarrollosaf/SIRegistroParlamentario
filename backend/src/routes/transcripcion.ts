import { Router, Request, Response } from 'express';
import axios from 'axios';
import Agenda from '../models/agendas';
import TranscripcionSesion from '../models/transcripcion_sesiones';
import TranscripcionParticipacion from '../models/transcripcion_participaciones';
import TranscripcionResumen from '../models/transcripcion_resumenes';

const router = Router();

// URL del servicio de transcripción (FastAPI). Configurable por entorno.
const TRANSCRIPTOR_URL = (process.env.TRANSCRIPTOR_URL || 'http://localhost:8000').replace(/\/$/, '');
// URL pública de ESTE backend, la que el transcriptor usará como webhook.
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || 'http://localhost:3013').replace(/\/$/, '');

// Corrida en curso por agenda: id de la sesión MySQL + último número de orden.
const corridas = new Map<string, { sesionId: string; orden: number }>();

/** Devuelve (y cachea) la corrida activa de una agenda; si el backend se
 *  reinició a media transcripción, la reconstruye desde la BD. */
async function corridaDe(idAgenda: string): Promise<{ sesionId: string; orden: number } | null> {
    const enMem = corridas.get(idAgenda);
    if (enMem) return enMem;
    const s: any = await TranscripcionSesion.findOne({
        where: { id_agenda: idAgenda }, order: [['createdAt', 'DESC']],
    });
    if (!s) return null;
    const max = await TranscripcionParticipacion.max('orden', { where: { id_sesion: s.id } });
    const info = { sesionId: s.id, orden: Number(max || 0) };
    corridas.set(idAgenda, info);
    return info;
}

/** La sesión más reciente (para las pantallas de revisión). */
async function sesionActual(idAgenda: string): Promise<any> {
    return TranscripcionSesion.findOne({
        where: { id_agenda: idAgenda }, order: [['createdAt', 'DESC']],
    });
}

/** Inicia la transcripción y crea la sesión en MySQL. */
router.post('/api/transcripcion/iniciar', async (req: Request, res: Response): Promise<any> => {
    try {
        const { idAgenda, modelo, voz } = req.body || {};
        if (!idAgenda) return res.status(400).json({ ok: false, msg: 'Falta idAgenda.' });

        const agenda: any = await Agenda.findByPk(idAgenda);
        if (!agenda) return res.status(404).json({ ok: false, msg: 'Agenda no encontrada.' });
        const youtubeUrl = agenda.liga;
        if (!youtubeUrl) {
            return res.status(400).json({ ok: false, msg: 'La sesión no tiene liga de YouTube (campo "liga" vacío).' });
        }

        const webhook = `${BACKEND_PUBLIC_URL}/api/transcripcion/linea`;
        const { data } = await axios.post(`${TRANSCRIPTOR_URL}/iniciar`, {
            idAgenda, youtubeUrl, webhook, modelo: modelo || 'small', voz: !!voz,
        });

        // Si no había una corrida viva, se crea una sesión nueva en MySQL.
        if (!data?.yaEnCurso) {
            const sesion: any = await TranscripcionSesion.create({
                id_agenda: idAgenda,
                titulo: agenda.descripcion || null,
                url: youtubeUrl,
                inicio: new Date(),
            });
            corridas.set(idAgenda, { sesionId: sesion.id, orden: 0 });
        } else {
            await corridaDe(idAgenda);
        }

        const io = req.app.get('io');
        io?.to(`transcripcion-${idAgenda}`).emit('transcripcion-estado', { idAgenda, transcribiendo: true });
        return res.json({ ok: true, ...data });
    } catch (err: any) {
        // Detalle explícito: sin esto un fallo de red se ve como un simple "Error".
        const detalle = err?.response
            ? { http: err.response.status, cuerpo: err.response.data }
            : { codigo: err?.code, mensaje: err?.message, url: `${TRANSCRIPTOR_URL}/iniciar` };
        console.error('[transcripcion/iniciar]', detalle);
        return res.status(500).json({
            ok: false, msg: 'No se pudo iniciar la transcripción.', detalle,
        });
    }
});

/** Detiene la transcripción. */
router.post('/api/transcripcion/detener', async (req: Request, res: Response): Promise<any> => {
    try {
        const { idAgenda } = req.body || {};
        if (!idAgenda) return res.status(400).json({ ok: false, msg: 'Falta idAgenda.' });

        const { data } = await axios.post(`${TRANSCRIPTOR_URL}/detener`, { idAgenda });

        const info = corridas.get(idAgenda);
        if (info) {
            await TranscripcionSesion.update({ fin: new Date() }, { where: { id: info.sesionId } });
            corridas.delete(idAgenda);
        }

        const io = req.app.get('io');
        io?.to(`transcripcion-${idAgenda}`).emit('transcripcion-estado', { idAgenda, transcribiendo: false });
        return res.json({ ok: true, ...data });
    } catch (err: any) {
        console.error('[transcripcion/detener]', err?.message || err);
        return res.status(500).json({ ok: false, msg: 'No se pudo detener la transcripción.' });
    }
});

/** ¿La sesión está transcribiendo ahora? */
router.get('/api/transcripcion/estado/:idAgenda', async (req: Request, res: Response): Promise<any> => {
    try {
        const { data } = await axios.get(`${TRANSCRIPTOR_URL}/estado/${req.params.idAgenda}`);
        return res.json({ ok: true, ...data });
    } catch {
        return res.json({ ok: true, idAgenda: req.params.idAgenda, transcribiendo: false });
    }
});

/**
 * Webhook (público): el transcriptor manda aquí cada intervención.
 * Se GUARDA en MySQL y se reemite por socket.io a la sesión.
 */
router.post('/api/transcripcion/linea', async (req: Request, res: Response): Promise<any> => {
    const linea = req.body || {};
    const idAgenda = linea.idAgenda;
    if (!idAgenda) return res.json({ ok: true });

    try {
        // Resolver la corrida; si el backend se reinició, crear una sesión.
        let info = await corridaDe(idAgenda);
        if (!info) {
            const sesion: any = await TranscripcionSesion.create({
                id_agenda: idAgenda, url: linea.url || null, inicio: new Date(),
            });
            info = { sesionId: sesion.id, orden: 0 };
            corridas.set(idAgenda, info);
        }
        info.orden += 1;

        await TranscripcionParticipacion.create({
            id_sesion: info.sesionId,
            orden: info.orden,
            orador: linea.orador ?? null,
            inicio_seg: linea.inicioSeg ?? null,
            fin_seg: linea.finSeg ?? null,
            inicio_hms: linea.inicioHms ?? null,
            fin_hms: linea.finHms ?? null,
            texto: linea.texto ?? null,
        });
    } catch (err: any) {
        console.error('[transcripcion/linea] no se pudo guardar en MySQL:', err?.message || err);
        // Se sigue reemitiendo aunque falle el guardado, para no cortar el vivo.
    }

    const io = req.app.get('io');
    io?.to(`transcripcion-${idAgenda}`).emit('transcripcion-linea', linea);
    return res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────
// Revisión y resúmenes (leídos/escritos en MySQL). Autenticadas.
// ─────────────────────────────────────────────────────────────────────────

/** Intervenciones + resúmenes guardados de la sesión más reciente. */
router.get('/api/transcripcion/sesion/:idAgenda', async (req: Request, res: Response): Promise<any> => {
    try {
        const sesion: any = await sesionActual(req.params.idAgenda);
        if (!sesion) return res.json({ sesionId: null, filas: [], resumenes: {} });

        const parts: any[] = await TranscripcionParticipacion.findAll({
            where: { id_sesion: sesion.id },
            order: [['orden', 'ASC'], ['createdAt', 'ASC']],
            raw: true,
        });
        const filas = parts.map((p) => ({
            id: p.id, orador: p.orador, inicio_hms: p.inicio_hms,
            inicio_seg: p.inicio_seg, texto: p.texto,
        }));
        const resArr: any[] = await TranscripcionResumen.findAll({
            where: { id_sesion: sesion.id }, raw: true,
        });
        const resumenes: Record<string, string> = {};
        for (const r of resArr) resumenes[r.ancla_id] = r.resumen;

        return res.json({ sesionId: sesion.id, filas, resumenes });
    } catch (err: any) {
        console.error('[transcripcion/sesion]', err?.message || err);
        return res.status(500).json({ ok: false, msg: 'Error al leer la transcripción.' });
    }
});

/** Borra TODA la transcripción de la agenda en MySQL (para empezar de nuevo). */
router.delete('/api/transcripcion/sesion/:idAgenda', async (req: Request, res: Response): Promise<any> => {
    try {
        const idAgenda = req.params.idAgenda;
        const sesiones: any[] = await TranscripcionSesion.findAll({
            where: { id_agenda: idAgenda }, raw: true,
        });
        const ids = sesiones.map((s) => s.id);
        if (ids.length) {
            await TranscripcionResumen.destroy({ where: { id_sesion: ids } });
            await TranscripcionParticipacion.destroy({ where: { id_sesion: ids } });
            await TranscripcionSesion.destroy({ where: { id: ids } });
        }
        corridas.delete(idAgenda);
        return res.json({ ok: true, sesionesBorradas: ids.length });
    } catch (err: any) {
        console.error('[transcripcion/borrar]', err?.message || err);
        return res.status(500).json({ ok: false, msg: 'No se pudo borrar la transcripción.' });
    }
});

/** Corrige el orador de un turno (una o varias intervenciones). */
router.post('/api/transcripcion/sesion/:idAgenda/actualizar', async (req: Request, res: Response): Promise<any> => {
    try {
        const { ids, orador } = req.body || {};
        if (!Array.isArray(ids) || !ids.length || !orador) {
            return res.status(400).json({ ok: false, msg: 'Faltan datos.' });
        }
        const [cambios] = await TranscripcionParticipacion.update(
            { orador }, { where: { id: ids } });
        return res.json({ ok: true, cambios });
    } catch (err: any) {
        return res.status(500).json({ ok: false, msg: 'No se pudo corregir el orador.' });
    }
});

/** Renombra un orador en toda la sesión. */
router.post('/api/transcripcion/sesion/:idAgenda/renombrar', async (req: Request, res: Response): Promise<any> => {
    try {
        const { de, a } = req.body || {};
        if (!de || !a) return res.status(400).json({ ok: false, msg: 'Faltan datos.' });
        const sesion: any = await sesionActual(req.params.idAgenda);
        if (!sesion) return res.status(404).json({ ok: false, msg: 'Sin transcripción.' });
        const [cambios] = await TranscripcionParticipacion.update(
            { orador: a }, { where: { id_sesion: sesion.id, orador: de } });
        return res.json({ ok: true, cambios });
    } catch (err: any) {
        return res.status(500).json({ ok: false, msg: 'No se pudo renombrar.' });
    }
});

/** Edita el texto de un turno (todo queda en la primera intervención). */
router.post('/api/transcripcion/sesion/:idAgenda/texto', async (req: Request, res: Response): Promise<any> => {
    try {
        const { ids, texto } = req.body || {};
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ ok: false, msg: 'Faltan ids.' });
        await TranscripcionParticipacion.update({ texto }, { where: { id: ids[0] } });
        if (ids.length > 1) {
            await TranscripcionParticipacion.update({ texto: '' }, { where: { id: ids.slice(1) } });
        }
        return res.json({ ok: true });
    } catch (err: any) {
        return res.status(500).json({ ok: false, msg: 'No se pudo guardar el texto.' });
    }
});

/** Genera (con Claude, vía el transcriptor) y guarda el resumen de un turno. */
router.post('/api/transcripcion/sesion/:idAgenda/resumen', async (req: Request, res: Response): Promise<any> => {
    try {
        const { anclaId, orador, texto } = req.body || {};
        if (!texto) return res.status(400).json({ ok: false, msg: 'Sin texto.' });

        // El transcriptor genera el resumen con Claude y lo devuelve (no lo guarda).
        const { data } = await axios.post(`${TRANSCRIPTOR_URL}/resumen-texto`,
            { orador: orador || '', texto }, { timeout: 120000 });

        // Se guarda en MySQL solo si Claude lo generó automáticamente.
        if (data?.modo === 'auto' && data?.resumen && anclaId) {
            const sesion: any = await sesionActual(req.params.idAgenda);
            const existente: any = await TranscripcionResumen.findOne({ where: { ancla_id: anclaId } });
            if (existente) {
                await existente.update({ resumen: data.resumen, orador: orador || null });
            } else {
                await TranscripcionResumen.create({
                    id_sesion: sesion?.id || null, ancla_id: anclaId,
                    orador: orador || null, resumen: data.resumen,
                });
            }
        }
        return res.json(data);
    } catch (err: any) {
        return res.status(err?.response?.status || 500).json(
            err?.response?.data || { ok: false, msg: 'No se pudo generar el resumen.' });
    }
});

/** Borra el resumen guardado de un turno. */
router.delete('/api/transcripcion/sesion/:idAgenda/resumen/:anclaId', async (req: Request, res: Response): Promise<any> => {
    try {
        await TranscripcionResumen.destroy({ where: { ancla_id: req.params.anclaId } });
        return res.json({ ok: true });
    } catch {
        return res.status(500).json({ ok: false });
    }
});

/** Catálogo de diputados (del transcriptor) para sugerir nombres. */
router.get('/api/transcripcion/sesion/:idAgenda/catalogo', async (req: Request, res: Response): Promise<any> => {
    try {
        const { data } = await axios.get(`${TRANSCRIPTOR_URL}/sesion/${req.params.idAgenda}/catalogo`);
        return res.json(data);
    } catch {
        return res.json({ catalogo: [] });
    }
});

export default router;
