import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import  User  from '../models/user'
import  RolUsers  from '../models/role_users'
import  Roles  from '../models/role'
import { Op } from 'sequelize'  
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import  sequelizeSAF  from '../database/connection'


export const ReadUser = async (req: Request, res: Response): Promise<any> => {
    const listUser = await User.findAll();
    return res.json({
        msg: `List de categoría encontrada exitosamenteeeee`,
        data: listUser
    });
}



export const LoginUser = async (req: Request, res: Response, next: NextFunction):  Promise<any> => {
    const { name, password } = req.body;
    console.log(name)
    let passwordValid = false;
    let user: any = null;
    let bandera = true;


    user = await User.findOne({ 
        where: { name: name },
    })
    if (!user) {
        return res.status(400).json({
            msg: `Usuario no existe con el usuario ${name}`
        })
    }

    const hash = user.password.replace(/^\$2y\$/, '$2b$');
    passwordValid = await bcrypt.compare(password, hash);



    if (!passwordValid) {
        return res.status(402).json({
            msg: `Password Incorrecto => ${password}`
        })
    }

    const accessToken = jwt.sign(
        { rfc: name },
        process.env.SECRET_KEY || 'TSE-Poder-legislativo',
        { expiresIn: '2h' }
    );
    
    res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ más correcto para distinguir local vs producción
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000, // 2 horas
    path: '/',
    });
    console.log(accessToken)
    return res.json({ user,bandera })
}

export const getCurrentUser = (req: Request, res: Response) => {
    const user = (req as any).user;
    // Podrías consultar más info en la base de datos si quieres
    res.json({
    rfc: user.rfc,
    // otros datos si es necesario
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








