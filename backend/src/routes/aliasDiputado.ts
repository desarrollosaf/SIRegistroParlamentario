import { Router } from 'express';
import {
    listarDiputadosAlias,
    actualizarAliasDiputado,
    actualizarUsuarioDiputado,
    resetearPasswordDiputado,
} from '../controllers/aliasDiputado';

const router = Router();

// Todas requieren token (lo valida el middleware global en server.ts).
router.get('/api/alias-diputado/listar', listarDiputadosAlias);
router.put('/api/alias-diputado/:id', actualizarAliasDiputado);

// Usuario ligado al diputado (tabla users), enlazado por integrante_legislatura_id.
router.put('/api/alias-diputado/usuario/:integranteLegislaturaId', actualizarUsuarioDiputado);
router.post('/api/alias-diputado/usuario/:integranteLegislaturaId/reset-password', resetearPasswordDiputado);

export default router;
