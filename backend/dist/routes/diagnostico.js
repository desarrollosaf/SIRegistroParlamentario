"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnostico_1 = require("../controllers/diagnostico");
const router = (0, express_1.Router)();
// No está en el whitelist de rutas públicas de server.ts, así que pasa por
// verifyToken igual que el resto del panel admin — requiere sesión iniciada.
router.get('/api/diagnostico/db-ping', diagnostico_1.pingDb);
exports.default = router;
