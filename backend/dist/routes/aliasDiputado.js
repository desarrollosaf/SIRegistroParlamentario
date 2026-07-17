"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aliasDiputado_1 = require("../controllers/aliasDiputado");
const router = (0, express_1.Router)();
// Todas requieren token (lo valida el middleware global en server.ts).
router.get('/api/alias-diputado/listar', aliasDiputado_1.listarDiputadosAlias);
router.put('/api/alias-diputado/:id', aliasDiputado_1.actualizarAliasDiputado);
// Usuario ligado al diputado (tabla users), enlazado por integrante_legislatura_id.
router.put('/api/alias-diputado/usuario/:integranteLegislaturaId', aliasDiputado_1.actualizarUsuarioDiputado);
router.post('/api/alias-diputado/usuario/:integranteLegislaturaId/reset-password', aliasDiputado_1.resetearPasswordDiputado);
exports.default = router;
