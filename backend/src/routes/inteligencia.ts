import { Router } from 'express';
import { getIntegrantesMorena } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/morena/integrantes/', getIntegrantesMorena);

export default router;
