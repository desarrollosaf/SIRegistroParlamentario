import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import  User  from '../models/user'
import  RolUsers  from '../models/role_users'
import  Roles  from '../models/role'
import { Op } from 'sequelize'
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import  sequelizeSAF  from '../database/connection'
import IntegranteLegislatura from '../models/integrante_legislaturas'
import Diputado from '../models/diputado'


export const ReadUser = async (req: Request, res: Response): Promise<any> => {
    const listUser = await User.findAll();
    return res.json({
        msg: `List de categoría encontrada exitosamenteeeee`,
        data: listUser
    });
}



export const LoginUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, password } = req.body;
    let passwordValid = false;
    let bandera = true;

    const user = await User.findOne({
        where: { name },
        include: [{ model: RolUsers, as: 'rol_users', include: [{ model: Roles, as: 'role' }] }]
    }) as any;

    if (!user) {
        return res.status(400).json({ msg: `Usuario no existe con el usuario ${name}` });
    }

    const hash = user.password.replace(/^\$2y\$/, '$2b$');
    passwordValid = await bcrypt.compare(password, hash);

    if (!passwordValid) {
        return res.status(402).json({ msg: `Password Incorrecto` });
    }

    const roleName: string = user.rol_users?.role?.name || 'admin';

    const accessToken = jwt.sign(
        { rfc: name, role: roleName, integrante_legislatura_id: user.integrante_legislatura_id || null },
        process.env.SECRET_KEY || 'TSE-Poder-legislativo',
        { expiresIn: '10h' }
    );

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 60 * 60 * 1000,
        path: '/',
    });

    // Obtener nombre completo del diputado vinculado
    let nombreCompleto: string = user.name;
    if (user.integrante_legislatura_id) {
        try {
            const integrante = await IntegranteLegislatura.findByPk(user.integrante_legislatura_id) as any;
            if (integrante?.diputado_id) {
                const diputado = await Diputado.findByPk(integrante.diputado_id) as any;
                if (diputado) {
                    nombreCompleto = diputado.alias ?? `${diputado.nombres} ${diputado.apaterno} ${diputado.amaterno}`.trim();
                }
            }
        } catch {}
    }

    return res.json({ user: { ...user.toJSON(), nombreCompleto }, bandera, role: roleName, token: accessToken });
}

export const getCurrentUser = (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({
        rfc: user.rfc,
        role: user.role || 'admin',
        integrante_legislatura_id: user.integrante_legislatura_id || null,
    });
};

export const cerrarsesion = async (req: Request, res: Response):  Promise<any> => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({ message: 'Sesión cerrada' });
};








