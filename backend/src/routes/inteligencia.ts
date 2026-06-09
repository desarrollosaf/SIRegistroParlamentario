import { Router } from 'express';
import { getIntegrantesPartido, getTodosLosIntegrantes, getIntegrante, buscarIniciativa, listarComisiones, buscarComision } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/todos/integrantes/', getTodosLosIntegrantes);
router.get('/api/inteligencia/diputado/buscar/', getIntegrante);
router.get('/api/inteligencia/:slug/integrantes/', getIntegrantesPartido);
router.get('/api/inteligencia/iniciativa/buscar/', buscarIniciativa);
router.get('/api/inteligencia/comisiones/', listarComisiones);
router.get('/api/inteligencia/comision/buscar/', buscarComision);

export default router;
