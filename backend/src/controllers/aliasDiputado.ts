import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Diputado from '../models/diputado';
import IntegranteLegislatura from '../models/integrante_legislaturas';
import User from '../models/user';

// Contraseña por defecto al resetear (configurable con DEFAULT_PASSWORD).
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Spid24_62';

// Lista los diputados con integrante_legislatura activo (fecha_fin = null) junto con
// los datos de su usuario (name, email) para poder editarlos.
export const listarDiputadosAlias = async (req: Request, res: Response): Promise<any> => {
    try {
        // Integrantes vigentes: sin fecha de fin (y no borrados, por el paranoid del modelo).
        const integrantes = await IntegranteLegislatura.findAll({
            where: { fecha_fin: null },
            attributes: ['id', 'diputado_id'],
            raw: true,
        }) as any[];

        const diputadoIds = [...new Set(integrantes.map((i: any) => i.diputado_id).filter(Boolean))];
        const integranteIds = [...new Set(integrantes.map((i: any) => i.id).filter(Boolean))];

        if (diputadoIds.length === 0) {
            return res.json({ msg: 'Diputados obtenidos correctamente', data: [] });
        }

        // Diputados (conexión legislativo).
        const diputados = await Diputado.findAll({
            where: { id: diputadoIds },
            attributes: ['id', 'nombres', 'apaterno', 'amaterno', 'alias'],
            raw: true,
        }) as any[];
        const diputadoMap: Record<string, any> = Object.fromEntries(diputados.map((d: any) => [d.id, d]));

        // Usuarios (conexión registrocomisiones): se enlazan por integrante_legislatura_id.
        const usuarios = await User.findAll({
            where: { integrante_legislatura_id: integranteIds },
            attributes: ['id', 'name', 'email', 'integrante_legislatura_id'],
            raw: true,
        }) as any[];
        const userMap: Record<string, any> = Object.fromEntries(
            usuarios.map((u: any) => [u.integrante_legislatura_id, u])
        );

        // Una fila por integrante activo, con su diputado y su usuario (si existe).
        const data = integrantes
            .filter((i: any) => diputadoMap[i.diputado_id])
            .map((i: any) => {
                const dip = diputadoMap[i.diputado_id];
                const user = userMap[i.id] ?? null;
                return {
                    integrante_legislatura_id: i.id,
                    diputado_id: dip.id,
                    nombres: dip.nombres,
                    apaterno: dip.apaterno,
                    amaterno: dip.amaterno,
                    alias: dip.alias,
                    user_id: user?.id ?? null,
                    name: user?.name ?? null,
                    email: user?.email ?? null,
                    tiene_usuario: !!user,
                };
            })
            .sort((a: any, b: any) =>
                `${a.apaterno} ${a.amaterno} ${a.nombres}`.localeCompare(`${b.apaterno} ${b.amaterno} ${b.nombres}`)
            );

        return res.json({ msg: 'Diputados obtenidos correctamente', data });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al obtener diputados', error: error.message });
    }
};

// Actualiza únicamente el alias de un diputado por su id.
export const actualizarAliasDiputado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const aliasRaw = req.body?.alias;

        // Normaliza: cadena vacía → null (para limpiar el alias).
        const alias: string | null =
            typeof aliasRaw === 'string' && aliasRaw.trim() !== '' ? aliasRaw.trim() : null;

        const diputado = await Diputado.findByPk(id) as any;
        if (!diputado) {
            return res.status(404).json({ msg: `No se encontró el diputado con id ${id}` });
        }

        await diputado.update({ alias });

        return res.json({ msg: 'Alias actualizado correctamente', data: { id: diputado.id, alias: diputado.alias } });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al actualizar el alias', error: error.message });
    }
};

// Actualiza el usuario (name) y el correo del usuario ligado a un integrante_legislatura.
export const actualizarUsuarioDiputado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { integranteLegislaturaId } = req.params;
        const nameRaw = req.body?.name;
        const emailRaw = req.body?.email;

        const user = await User.findOne({
            where: { integrante_legislatura_id: integranteLegislaturaId }
        }) as any;

        if (!user) {
            return res.status(404).json({ msg: 'Este diputado no tiene un usuario asignado' });
        }

        const cambios: { name?: string; email?: string | null } = {};

        if (typeof nameRaw === 'string') {
            const name = nameRaw.trim();
            if (name === '') {
                return res.status(400).json({ msg: 'El usuario (name) no puede quedar vacío' });
            }
            cambios.name = name;
        }

        if (typeof emailRaw === 'string') {
            const email = emailRaw.trim();
            cambios.email = email === '' ? null : email;
        }

        if (Object.keys(cambios).length === 0) {
            return res.status(400).json({ msg: 'No se enviaron cambios (name o email)' });
        }

        await user.update(cambios);

        return res.json({
            msg: 'Usuario actualizado correctamente',
            data: {
                user_id: user.id,
                integrante_legislatura_id: user.integrante_legislatura_id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al actualizar el usuario', error: error.message });
    }
};

// Resetea la contraseña del usuario ligado a un integrante_legislatura a la contraseña por defecto.
export const resetearPasswordDiputado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { integranteLegislaturaId } = req.params;

        const user = await User.findOne({
            where: { integrante_legislatura_id: integranteLegislaturaId }
        }) as any;

        if (!user) {
            return res.status(404).json({ msg: 'Este diputado no tiene un usuario asignado' });
        }

        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        await user.update({ password: passwordHash });

        return res.json({
            msg: 'Contraseña restablecida correctamente',
            data: { user_id: user.id, password_default: DEFAULT_PASSWORD },
        });
    } catch (error: any) {
        return res.status(500).json({ msg: 'Error al restablecer la contraseña', error: error.message });
    }
};
