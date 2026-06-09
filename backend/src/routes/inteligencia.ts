import { Router } from 'express';
import { getIntegrantesPartido, getTodosLosIntegrantes, getIntegrante, buscarIniciativa } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/todos/integrantes/', getTodosLosIntegrantes);
router.get('/api/inteligencia/diputado/buscar/', getIntegrante);
router.get('/api/inteligencia/:slug/integrantes/', getIntegrantesPartido);
router.get('/api/inteligencia/iniciativa/buscar/', buscarIniciativa);

export default router;
