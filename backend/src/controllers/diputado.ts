import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user';
import RolUsers from '../models/role_users';
import Roles from '../models/role';
import Diputado from '../models/diputado'; // Importar primero — define la asociación belongsTo con IntegranteLegislatura
import IntegranteLegislatura from '../models/integrante_legislaturas';
import AsistenciaVoto from '../models/asistencia_votos';
import sequelizeSAF from '../database/registrocomisiones';

// Crea cuentas de usuario para todos los diputados activos que aún no tienen cuenta
export const crearCuentasDiputados = async (req: Request, res: Response): Promise<any> => {
    try {
        // Buscar el rol "diputado" o crearlo si no existe
        let [rolDiputado] = await Roles.findOrCreate({
            where: { name: 'diputado' },
            defaults: { name: 'diputado', desc: 'Rol para diputados activos' }
        });

        // Obtener todos los integrantes de la legislatura activa
        const integrantes = await IntegranteLegislatura.findAll() as any[];

        if (!integrantes.length) {
            return res.status(404).json({ msg: 'No se encontraron integrantes en integrante_legislaturas' });
        }

        // Traer todos los diputados relacionados en una sola consulta
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
            // Usamos el id del integrante como username (único y rastreable)
            const username = `DIP-${integrante.id.substring(0, 8).toUpperCase()}`;

            // Verificar si ya existe usuario para este integrante
            const existeUser = await User.findOne({
                where: { integrante_legislatura_id: integrante.id }
            });

            if (existeUser) {
                existentes.push(nombreCompleto);
                continue;
            }

            try {
                // Contraseña inicial = DIP + primeras 8 chars del id (se puede cambiar después)
                const passwordPlain = `DIP-${integrante.id.substring(0, 8)}`;
                const passwordHash = await bcrypt.hash(passwordPlain, 10);

                const nuevoUser = await User.create({
                    id: uuidv4(),
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

// Registrar asistencia del diputado en la sesión activa
export const registrarAsistencia = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const { id_agenda, partido_dip, comision_dip_id, id_cargo_dip, orden } = req.body;

        if (!id_agenda) {
            return res.status(400).json({ msg: 'id_agenda es requerido' });
        }

        // Verificar si ya registró asistencia en esta agenda
        const yaRegistro = await AsistenciaVoto.findOne({
            where: {
                id_diputado: integranteLegislaturaId,
                id_agenda,
                sentido_voto: 0,
            }
        });

        if (yaRegistro) {
            return res.status(409).json({ msg: 'Ya registraste tu asistencia en esta sesión' });
        }

        const asistencia = await AsistenciaVoto.create({
            sentido_voto: 0, // 0 = asistencia
            mensaje: 'Asistencia registrada por el diputado',
            id_diputado: integranteLegislaturaId,
            partido_dip: partido_dip || '',
            comision_dip_id: comision_dip_id || null,
            orden: orden || null,
            id_cargo_dip: id_cargo_dip || null,
            id_agenda,
            usuario_registra: null,
        });

        // Notificar via socket
        const io = req.app.get('io');
        if (io) {
            io.to(`proyeccion-${comision_dip_id}`).emit('asistencia-registrada', {
                id_diputado: integranteLegislaturaId,
                id_agenda,
            });
        }

        return res.status(201).json({ msg: 'Asistencia registrada correctamente', data: asistencia });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al registrar asistencia', error: error.message });
    }
};

// Registrar voto del diputado en un punto del orden del día
export const registrarVoto = async (req: Request, res: Response): Promise<any> => {
    try {
        const tokenUser = (req as any).user;
        const integranteLegislaturaId: string = tokenUser.integrante_legislatura_id;

        if (!integranteLegislaturaId) {
            return res.status(403).json({ msg: 'Tu cuenta no está vinculada a un perfil de diputado' });
        }

        const { id_agenda, sentido_voto, partido_dip, comision_dip_id, id_cargo_dip, orden } = req.body;

        // sentido_voto: 1=a favor, 2=abstención, 3=en contra
        if (!id_agenda || sentido_voto === undefined) {
            return res.status(400).json({ msg: 'id_agenda y sentido_voto son requeridos' });
        }

        if (![1, 2, 3].includes(Number(sentido_voto))) {
            return res.status(400).json({ msg: 'sentido_voto debe ser 1 (a favor), 2 (abstención) o 3 (en contra)' });
        }

        // Verificar si ya votó en esta agenda (votos tienen sentido_voto > 0)
        const yaVoto = await AsistenciaVoto.findOne({
            where: {
                id_diputado: integranteLegislaturaId,
                id_agenda,
                sentido_voto: [1, 2, 3] as any,
            }
        });

        if (yaVoto) {
            return res.status(409).json({ msg: 'Ya registraste tu voto en este punto' });
        }

        const voto = await AsistenciaVoto.create({
            sentido_voto: Number(sentido_voto),
            mensaje: sentido_voto == 1 ? 'A favor' : sentido_voto == 2 ? 'Abstención' : 'En contra',
            id_diputado: integranteLegislaturaId,
            partido_dip: partido_dip || '',
            comision_dip_id: comision_dip_id || null,
            orden: orden || null,
            id_cargo_dip: id_cargo_dip || null,
            id_agenda,
            usuario_registra: null,
        });

        // Notificar via socket
        const io = req.app.get('io');
        if (io) {
            io.to(`proyeccion-${comision_dip_id}`).emit('voto-registrado', {
                id_diputado: integranteLegislaturaId,
                sentido_voto: Number(sentido_voto),
                id_agenda,
            });
        }

        return res.status(201).json({ msg: 'Voto registrado correctamente', data: voto });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al registrar voto', error: error.message });
    }
};

// Obtener el estado actual de la sesión activa para el panel del diputado
export const getSesionActiva = async (req: Request, res: Response): Promise<any> => {
    try {
        const { idComision } = req.params;

        // agendas y puntos_ordens están en la BD registrocomisiones
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

        // Obtener los puntos del orden del día de esa agenda
        const [puntos]: any = await sequelizeSAF.query(`
            SELECT po.id, po.punto, po.nopunto, po.observaciones
            FROM puntos_ordens po
            WHERE po.id_evento = :idAgenda
            ORDER BY po.nopunto ASC
        `, { replacements: { idAgenda: agenda.id } });

        return res.json({
            sesionActiva: true,
            agenda,
            puntos,
        });
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
