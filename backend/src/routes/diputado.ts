import { Router } from 'express';
import {
    crearCuentasDiputados,
    registrarAsistencia,
    registrarVoto,
    getSesionActiva,
    getMiPerfil,
} from '../controllers/diputado';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Solo admin puede crear cuentas de diputados
router.post('/api/diputado/crear-cuentas', crearCuentasDiputados);

// Rutas del diputado (requieren token)
router.get('/api/diputado/mi-perfil', verifyToken, getMiPerfil);
router.get('/api/diputado/sesion-activa/:idComision', verifyToken, getSesionActiva);
router.post('/api/diputado/registrar-asistencia', verifyToken, registrarAsistencia);
router.post('/api/diputado/registrar-voto', verifyToken, registrarVoto);

export default router;
