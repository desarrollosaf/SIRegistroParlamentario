import { Router } from 'express';
import { pingDb } from '../controllers/diagnostico';

const router = Router();

// No está en el whitelist de rutas públicas de server.ts, así que pasa por
// verifyToken igual que el resto del panel admin — requiere sesión iniciada.
router.get('/api/diagnostico/db-ping', pingDb);

export default router;
