import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ProyeccionGuardada from '../models/proyeccion_guardada';

// Crea la tabla proyeccion_guardadas la primera vez (CREATE TABLE IF NOT EXISTS), una sola vez.
let syncPromise: Promise<any> | null = null;
function asegurarTabla(): Promise<any> {
    if (!syncPromise) {
        syncPromise = ProyeccionGuardada.sync().catch((e) => {
            syncPromise = null; // permite reintentar si falló
            throw e;
        });
    }
    return syncPromise;
}

// Sube una imagen o video y devuelve su ruta relativa (servida en /storage).
export const subirArchivoProyeccion = async (req: Request, res: Response): Promise<any> => {
    const file = (req as any).file;
    if (!file) {
        return res.status(400).json({ msg: 'No se recibió ningún archivo' });
    }
    const path = `storage/proyeccion/${file.filename}`;
    const tipo = /^video\//.test(file.mimetype) ? 'video' : 'imagen';
    return res.json({ msg: 'Archivo subido', path, tipo });
};

// Lista las composiciones guardadas para una comisión (incluye las globales, comision_id null).
export const listarGuardadas = async (req: Request, res: Response): Promise<any> => {
    try {
        await asegurarTabla();
        const { comisionId } = req.params;

        const guardadas = await ProyeccionGuardada.findAll({
            where: {
                [Op.or]: [{ comision_id: comisionId }, { comision_id: null }],
            },
            order: [['created_at', 'DESC']],
        });

        return res.json({ msg: 'Composiciones obtenidas', data: guardadas });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al listar composiciones', error: error.message });
    }
};

// Guarda una composición para proyectarla después.
export const guardarComposicion = async (req: Request, res: Response): Promise<any> => {
    try {
        await asegurarTabla();
        const { comision_id, titulo, contenido } = req.body;

        if (!titulo || !String(titulo).trim()) {
            return res.status(400).json({ msg: 'El título es requerido' });
        }
        if (!contenido || !contenido.tipo) {
            return res.status(400).json({ msg: 'El contenido es inválido' });
        }

        const nueva = await ProyeccionGuardada.create({
            comision_id: comision_id || null,
            titulo: String(titulo).trim(),
            tipo: contenido.tipo,
            contenido,
        });

        return res.json({ msg: 'Composición guardada', data: nueva });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al guardar la composición', error: error.message });
    }
};

// Elimina una composición guardada.
export const eliminarComposicion = async (req: Request, res: Response): Promise<any> => {
    try {
        await asegurarTabla();
        const { id } = req.params;

        const borradas = await ProyeccionGuardada.destroy({ where: { id } });
        if (borradas === 0) {
            return res.status(404).json({ msg: 'No se encontró la composición' });
        }

        return res.json({ msg: 'Composición eliminada' });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al eliminar la composición', error: error.message });
    }
};
