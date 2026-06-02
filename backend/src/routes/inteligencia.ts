import { Router } from 'express';
import { getIntegrantesMorena, getIntegrantesVerde } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/morena/integrantes/', getIntegrantesMorena);
router.get('/api/inteligencia/verde/integrantes/', getIntegrantesVerde);

export default router;
