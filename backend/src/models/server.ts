import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors'
import path from 'path';
import eventos from "../routes/eventos";
import user from "../routes/user";
import catalogos from "../routes/catalogos";
import diputados from "../routes/diputados";
import { verifyToken } from '../middlewares/auth';
import cookieParser from 'cookie-parser';

class Server {

    private app: Application
    private port: string
    

    constructor(){
        this.app = express()
        this.port = process.env.PORT || '3013'
        this.midlewares();
        this.router();
        this.DBconnetc();
        this.listen();  
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log("La aplicación se esta corriendo exitosamente en el puerto => "+ this.port)           
        })
    }

    router(){
       this.app.use(eventos);
       this.app.use(user);
       this.app.use(diputados);
       this.app.use(catalogos);

    }

    
    midlewares(){
       this.app.use(express.json())
       this.app.use(cors({
           origin: function (origin, callback) {
                const allowedOrigins = ['http://localhost:4200'];
                if (!origin || allowedOrigins.includes(origin) ) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS')); 
                }
            },
            credentials: true
        }));

        this.app.use(cookieParser());
        this.app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const publicPaths = [
                '/api/user/login',
                '/api/eventos/gettipos/',
                '/api/diputados/cargo/',
                '/api/eventos/savereserva/',
                '/api/eventos/eliminarreserva/',
                '/api/diputados/getinfiniciativa/'
            ];

            const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));
            
            if (isPublic) {
                return next(); 
            }


           return verifyToken(req, res, next);
        });

    }

    async DBconnetc(){
        try {
            
            console.log("Conexion de DB exitoso");

        } catch (error) {
            console.log("Conexion de DB errorena => "+error);
            
        }
    }

    
}


export default Server