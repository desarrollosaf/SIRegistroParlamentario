import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors'
import path from 'path';

class Server {

    private app: Application
    private port: string
    

    constructor(){
        this.app = express()
        this.port = process.env.PORT || '3012'
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
       

    }

    
    midlewares(){
        this.app.use(express.json())
        this.app.use(cors({
            origin: 'http://localhost:4200',
            //origin: 'https://ofrendas.congresoedomex.gob.mx',
            credentials: true
        }));

       
        this.app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const publicPaths = [
                '/api/user/login',
                '/api/registro/datos/',
                '/api/registro/saveregistro/',
            ];
            const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));
            if (isPublic) {
                return next(); 
            }
            
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