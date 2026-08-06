/**
 * `agendas.fecha` es TIMESTAMP real (guarda hora, no solo fecha) — muchas
 * reuniones de comisión tienen hora específica (ej. 21:00 UTC ≈ 3pm local).
 * Comparar con `fecha = 'YYYY-MM-DD'` falla en silencio para esos casos
 * (solo matchea la convención de "medianoche"). Hay que comparar por
 * DATE(fecha), que MySQL evalúa en la zona horaria de la conexión — la
 * misma que usa la app para mostrarle la fecha al usuario.
 */
import { fn, col, where as sequelizeWhere, Op } from 'sequelize';
import Agenda from '../../models/agendas';

export async function buscarAgendasPorFecha(fechaISO: string, tipoEventoId: string) {
  return Agenda.findAll({
    where: {
      tipo_evento_id: tipoEventoId,
      [Op.and]: [sequelizeWhere(fn('DATE', col('fecha')), fechaISO)],
    } as any,
  });
}
