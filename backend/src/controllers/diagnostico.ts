import { Request, Response } from 'express';
import legislativoConnection from '../database/legislativoConnection';
import registrocomisiones from '../database/registrocomisiones';
import pleno from '../database/pleno';

/**
 * Corre un SELECT 1 dos veces seguidas contra una conexión YA VIVA en este
 * proceso (no una nueva) — si la primera sale mucho más lenta que la
 * segunda (p.ej. 5200ms vs 4ms), el retraso está en obtener/crear la
 * conexión del pool, no en ejecutar la consulta en sí.
 */
async function medirDosConsultas(sequelize: any): Promise<{ primera_ms: number; segunda_ms?: number; error?: string }> {
    const t1 = Date.now();
    try {
        await sequelize.query('SELECT 1');
    } catch (error: any) {
        return { primera_ms: Date.now() - t1, error: error.message };
    }
    const primera_ms = Date.now() - t1;

    const t2 = Date.now();
    try {
        await sequelize.query('SELECT 1');
    } catch (error: any) {
        return { primera_ms, segunda_ms: Date.now() - t2, error: error.message };
    }
    return { primera_ms, segunda_ms: Date.now() - t2 };
}

/**
 * Diagnóstico temporal para la lentitud intermitente reportada en
 * detalle-comisión (ver conversación/commits alrededor de esta fecha).
 * Pégale a este endpoint justo cuando notes la lentitud (o después de dejar
 * el sistema inactivo un rato) para ver en qué conexión está el retraso y
 * si es la conexión o la consulta. Quitar una vez resuelto el diagnóstico.
 */
export const pingDb = async (req: Request, res: Response): Promise<any> => {
    const [legislativo, registrocomisionesRes, plenoRes] = await Promise.all([
        medirDosConsultas(legislativoConnection),
        medirDosConsultas(registrocomisiones),
        medirDosConsultas(pleno),
    ]);

    return res.json({
        legislativo,
        registrocomisiones: registrocomisionesRes,
        pleno: plenoRes,
    });
};
