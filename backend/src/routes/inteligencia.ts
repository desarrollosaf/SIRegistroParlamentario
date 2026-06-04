import { Router } from 'express';
import { getIntegrantesPartido, buscarIniciativa } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/:slug/integrantes/', getIntegrantesPartido);
router.get('/api/inteligencia/iniciativa/buscar/', buscarIniciativa);

export default router;
