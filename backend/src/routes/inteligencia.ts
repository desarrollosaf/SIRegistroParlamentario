import { Router } from 'express';
import { getIntegrantesPartido } from '../controllers/inteligencia';

const router = Router();

router.get('/api/inteligencia/:slug/integrantes/', getIntegrantesPartido);

export default router;
