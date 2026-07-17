import { Router, Request, Response, NextFunction } from 'express';
import uploadProyeccion from '../controllers/multerProyeccion';
import {
    subirArchivoProyeccion,
    listarGuardadas,
    guardarComposicion,
    eliminarComposicion,
} from '../controllers/proyeccion';

const router = Router();

// Subida de archivo (imagen/video) con manejo de errores de multer.
router.post('/api/proyeccion/upload', (req: Request, res: Response, next: NextFunction) => {
    uploadProyeccion.single('archivo')(req, res, (err: any) => {
        if (err) return res.status(400).json({ msg: err.message });
        next();
    });
}, subirArchivoProyeccion);

// Composiciones guardadas.
router.get('/api/proyeccion/guardadas/:comisionId', listarGuardadas);
router.post('/api/proyeccion/guardadas', guardarComposicion);
router.delete('/api/proyeccion/guardadas/:id', eliminarComposicion);

export default router;
