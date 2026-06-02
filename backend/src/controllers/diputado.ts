import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import RolUsers from '../models/role_users';
import Roles from '../models/role';
import Diputado from '../models/diputado';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import AsistenciaVoto from '../models/asistencia_votos';
import VotosPunto from '../models/votos_punto';
import sequelizeSAF from '../database/registrocomisiones';

// Helper: obtiene el diputado_id real desde el integrante_legislatura_id del token.
// AsistenciaVoto y VotosPunto almacenan diputado.id, no integrante_legislatura.id.
async function getDiputadoId(integranteLegislaturaId: string): Promise<string | null> {
    const integrante = await IntegranteLegislatura.findByPk(integranteLegislaturaId) as any;
    return integrante?.diputado_id ?? null;
}

// Helper: obtiene descripcion y fecha del evento desde la BD SAF.
async function getInfoEvento(idAgenda: any): Promise<{ descripcion: string; fecha: string } | null> {
    try {
        const [rows]: any = await sequelizeSAF.query(
            'SELECT id, descripcion, fecha FROM agendas WHERE id = :id LIMIT 1',
            { replacements: { id: idAgenda } }
        );
        if (!rows.length) return null;
        return { descripcion: rows[0].descripcion, fecha: rows[0].fecha };
    } catch {
        return null;
    }
}

// Crea cuentas de usuario para todos los diputados activos que aún no tienen cuenta
export const crearCuentasDiputados = async (req: Request, res: Response): Promise<any> => {
    try {
        let [rolDiputado] = await Roles.findOrCreate({
            where: { name: 'diputado' },
            defaults: { name: 'diputado', desc: 'Rol para diputados activos' }
        });

        const integrantes = await IntegranteLegislatura.findAll({ where: { fecha_fin: null } }) as any[];

        if (!integrantes.length) {
            return res.status(404).json({ msg: 'No se encontraron integrantes en integrante_legislaturas' });
        }

        const diputadoIds = integrantes.map((i: any) => i.diputado_id);
        const diputadosList = await Diputado.findAll({ where: { id: diputadoIds } }) as any[];
        const diputadoMap: Record<string, any> = Object.fromEntries(diputadosList.map((d: any) => [d.id, d]));

        const creados: string[] = [];
        const existentes: string[] = [];
        const errores: string[] = [];

        for (const integrante of integrantes) {
            const dip = diputadoMap[integrante.diputado_id];
            if (!dip) continue;

            const nombreCompleto = `${dip.apaterno} ${dip.amaterno} ${dip.nombres}`.trim();
            const username = `DIP-${dip.nombres.substring(0, 8).toUpperCase()}`;

            const existeUser = await User.findOne({
                where: { integrante_legislatura_id: integrante.id }
            });

            if (existeUser) {
                existentes.push(nombreCompleto);
                continue;
            }

            try {
                const passwordPlain = `DIP-${integrante.id.substring(0, 8)}`;
                const passwordHash = await bcrypt.hash(passwordPlain, 10);

                const nuevoUser = await User.create({
                    name: username,
                    email: dip.email || null,
                    password: passwordHash,
                    integrante_legislatura_id: integrante.id,
                });

                await RolUsers.create({
                    role_id: rolDiputado.id,
                    user_id: nuevoUser.id,
                });

                creados.push(`${nombreCompleto} → usuario: ${username} / pass: ${passwordPlain}`);
            } catch (err: any) {
                errores.push(`${nombreCompleto}: ${err.message}`);
            }
        }

        return res.json({
            msg: 'Proceso completado',
            creados: creados.length,
            existentes: existentes.length,
            errores: errores.length,
            detalle_creados: creados,
            detalle_errores: errores,
        });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al crear cuentas', error: error.message });
    }
};

// Registrar asistencia del diputado: busca el registro PENDIENTE y lo actualiza.
// El frontend pasa id_comision para que el backend emita el socket al room correcto.
export const registrarAsistencia = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const { id_agenda, id_comision, partido_dip, id_cargo_dip, orden } = req.body;

        if (!id_agenda) {
            return res.status(400).json({ msg: 'id_agenda es requerido' });
        }

        const diputadoId = await getDiputadoId(integranteLegislaturaId);
        if (!diputadoId) {
            return res.status(404).json({ msg: 'No se encontró el perfil de diputado vinculado a tu cuenta.' });
        }

        const registro = await AsistenciaVoto.findOne({
            where: { id_diputado: diputadoId, id_agenda }
        });

        if (!registro) {
            return res.status(404).json({ msg: 'No se encontró registro de asistencia. El administrador debe iniciar la sesión.' });
        }

        if (registro.sentido_voto !== 0) {
            return res.status(409).json({ msg: 'Ya registraste tu asistencia en esta sesión' });
        }

        // sentido_voto=1 = ASISTENCIA (igual que cuando el admin marca manualmente)
        await registro.update({
            sentido_voto: 1,
            mensaje: 'ASISTENCIA',
            ...(partido_dip && { partido_dip }),
            ...(id_cargo_dip && { id_cargo_dip }),
            ...(orden !== undefined && { orden }),
        });

        // El room lo provee el frontend: es idComisionRuta del admin.
        // Para comisiones coincide con comision_dip_id; para sesiones plenarias el frontend lo envía explícitamente.
        const roomId = id_comision || registro.comision_dip_id;
        const io = req.app.get('io');
        if (io && roomId) {
            io.to(`proyeccion-${roomId}`).emit('asistencia-registrada', {
                id_diputado: diputadoId,
                id_agenda,
            });
        }

        return res.status(200).json({ msg: 'Asistencia registrada correctamente', data: registro });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al registrar asistencia', error: error.message });
    }
};

// Registrar voto del diputado: busca el VotosPunto PENDIENTE y lo actualiza.
export const registrarVoto = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const { sentido_voto, id_voto_punto, id_comision } = req.body;

        if (sentido_voto === undefined) {
            return res.status(400).json({ msg: 'sentido_voto es requerido' });
        }

        if (![1, 2, 3].includes(Number(sentido_voto))) {
            return res.status(400).json({ msg: 'sentido_voto debe ser 1 (a favor), 2 (abstención) o 3 (en contra)' });
        }

        const diputadoIdVoto = await getDiputadoId(integranteLegislaturaId);
        if (!diputadoIdVoto) {
            return res.status(404).json({ msg: 'No se encontró el perfil de diputado vinculado a tu cuenta.' });
        }

        if (!id_voto_punto) {
            return res.status(400).json({ msg: 'id_voto_punto es requerido' });
        }

        const votoRegistro = await VotosPunto.findOne({
            where: { id: id_voto_punto, id_diputado: diputadoIdVoto }
        });

        if (!votoRegistro) {
            return res.status(404).json({ msg: 'No se encontró el registro de votación para este diputado.' });
        }

        const sentido = Number(sentido_voto);
        const mensajeVoto = sentido === 1 ? 'A favor' : sentido === 2 ? 'Abstención' : 'En contra';

        await votoRegistro.update({ sentido, mensaje: mensajeVoto });

        const roomIdVoto = id_comision || votoRegistro.id_comision_dip;
        const io = req.app.get('io');
        if (io && roomIdVoto) {
            io.to(`proyeccion-${roomIdVoto}`).emit('voto-registrado', {
                id_diputado: diputadoIdVoto,
                sentido_voto: sentido,
                id: votoRegistro.id,
            });
        }

        return res.status(200).json({ msg: 'Voto registrado correctamente', data: votoRegistro });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al registrar voto', error: error.message });
    }
};

// Retorna el estado actual del panel para el diputado (persiste al recargar).
// Incluye descripcion y fecha del evento para mostrar en pantalla.
export const getEstadoPanel = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const diputadoIdPanel = await getDiputadoId(integranteLegislaturaId);
        if (!diputadoIdPanel) {
            return res.json({ asistencia: null, votacion: null });
        }

        const asistenciasAbiertas: Map<string, { idAgenda: string }> =
            req.app.get('asistenciasAbiertas') || new Map();
        const votacionesAbiertas: Map<string, { idAgenda: string; punto: any; idPunto?: any; idReserva?: string | null; idIniciativa?: string | null }> =
            req.app.get('votacionesAbiertas') || new Map();

        let asistenciaPanel: any = null;
        let votacionPanel: any = null;

        for (const [idComision, estado] of asistenciasAbiertas.entries()) {
            const registro = await AsistenciaVoto.findOne({
                where: { id_diputado: diputadoIdPanel, id_agenda: estado.idAgenda }
            });
            if (registro) {
                const eventoInfo = await getInfoEvento(estado.idAgenda);
                asistenciaPanel = {
                    idComision,
                    idAgenda: estado.idAgenda,
                    yaRegistro: registro.sentido_voto !== 0,
                    descripcion: eventoInfo?.descripcion || '',
                    fecha: eventoInfo?.fecha || '',
                };
                break;
            }
        }

        for (const [idComision, estado] of votacionesAbiertas.entries()) {
            const { idPunto, idReserva, idIniciativa } = estado;

            let whereVoto: any = { id_diputado: diputadoIdPanel };

            if (idReserva) {
                whereVoto.id_tema_punto_voto = idReserva;
            } else if (idPunto && idIniciativa) {
                whereVoto.id_punto = idPunto;
                whereVoto.id_iniciativa = idIniciativa;
            } else if (idPunto) {
                whereVoto.id_punto = idPunto;
                whereVoto.id_iniciativa = null;
            } else {
                whereVoto.id_comision_dip = idComision;
                whereVoto.sentido = 0;
            }

            const votoRegistro = await VotosPunto.findOne({ where: whereVoto });
            if (votoRegistro) {
                const eventoInfo = await getInfoEvento(estado.idAgenda);
                votacionPanel = {
                    idComision,
                    idAgenda: estado.idAgenda,
                    punto: estado.punto,
                    id_voto_punto: votoRegistro.id,
                    yaVoto: (votoRegistro.sentido ?? 0) !== 0,
                    sentidoActual: votoRegistro.sentido,
                    descripcion: eventoInfo?.descripcion || '',
                    fecha: eventoInfo?.fecha || '',
                };
                break;
            }
        }

        return res.json({ asistencia: asistenciaPanel, votacion: votacionPanel });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al obtener estado del panel', error: error.message });
    }
};

// Obtener el estado actual de la sesión activa para el panel del diputado
export const getSesionActiva = async (req: Request, res: Response): Promise<any> => {
    try {
        const { idComision } = req.params;

        const [agendaRows]: any = await sequelizeSAF.query(`
            SELECT a.id, a.descripcion, a.fecha, a.hora, a.status
            FROM agendas a
            INNER JOIN anfitrion_agendas aa ON aa.agenda_id = a.id
            WHERE aa.comision_id = :idComision
              AND a.status = 1
            ORDER BY a.fecha DESC, a.hora DESC
            LIMIT 1
        `, { replacements: { idComision } });

        if (!agendaRows.length) {
            return res.json({ sesionActiva: false });
        }

        const agenda = agendaRows[0];

        const [puntos]: any = await sequelizeSAF.query(`
            SELECT po.id, po.punto, po.nopunto, po.observaciones
            FROM puntos_ordens po
            WHERE po.id_evento = :idAgenda
            ORDER BY po.nopunto ASC
        `, { replacements: { idAgenda: agenda.id } });

        return res.json({ sesionActiva: true, agenda, puntos });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al obtener sesión activa', error: error.message });
    }
};

// Obtener el perfil del diputado logueado
export const getMiPerfil = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const integrante = await IntegranteLegislatura.findByPk(integranteLegislaturaId) as any;

        if (!integrante) {
            return res.status(404).json({ msg: 'Perfil de diputado no encontrado' });
        }

        const diputado = await Diputado.findByPk(integrante.diputado_id) as any;

        return res.json({ integrante: { ...integrante.toJSON(), diputado } });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al obtener perfil', error: error.message });
    }
};
