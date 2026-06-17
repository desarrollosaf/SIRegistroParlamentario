import { Router } from 'express';
import {
    crearCuentasDiputados,
    registrarAsistencia,
    registrarVoto,
    getSesionActiva,
    getMiPerfil,
    getEstadoPanel,
    getMisComisiones,
    getMiAsistencia,
    getOrdenDelDia,
    getMisVotos,
    getSesionesComisionesActivas,
    getComisionInfo,
} from '../controllers/diputado';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Solo admin puede crear cuentas de diputados
router.post('/api/diputado/crear-cuentas', crearCuentasDiputados);

// Rutas del diputado (requieren token)
router.get('/api/diputado/mi-perfil', verifyToken, getMiPerfil);
router.get('/api/diputado/estado-panel', verifyToken, getEstadoPanel);
router.get('/api/diputado/sesion-activa/:idComision', verifyToken, getSesionActiva);
router.post('/api/diputado/registrar-asistencia', verifyToken, registrarAsistencia);
router.post('/api/diputado/registrar-voto', verifyToken, registrarVoto);
router.get('/api/diputado/mis-comisiones', verifyToken, getMisComisiones);
router.get('/api/diputado/sesiones-comisiones-activas', verifyToken, getSesionesComisionesActivas);
router.get('/api/diputado/mi-asistencia/:idAgenda', verifyToken, getMiAsistencia);
router.get('/api/diputado/orden-del-dia/:idAgenda', verifyToken, getOrdenDelDia);
router.get('/api/diputado/mis-votos/:idAgenda', verifyToken, getMisVotos);
router.get('/api/diputado/comision/:idComision/info', verifyToken, getComisionInfo);

export default router;
