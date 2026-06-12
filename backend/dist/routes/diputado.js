"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diputado_1 = require("../controllers/diputado");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Solo admin puede crear cuentas de diputados
router.post('/api/diputado/crear-cuentas', diputado_1.crearCuentasDiputados);
// Rutas del diputado (requieren token)
router.get('/api/diputado/mi-perfil', auth_1.verifyToken, diputado_1.getMiPerfil);
router.get('/api/diputado/estado-panel', auth_1.verifyToken, diputado_1.getEstadoPanel);
router.get('/api/diputado/sesion-activa/:idComision', auth_1.verifyToken, diputado_1.getSesionActiva);
router.post('/api/diputado/registrar-asistencia', auth_1.verifyToken, diputado_1.registrarAsistencia);
router.post('/api/diputado/registrar-voto', auth_1.verifyToken, diputado_1.registrarVoto);
router.get('/api/diputado/mis-comisiones', auth_1.verifyToken, diputado_1.getMisComisiones);
router.get('/api/diputado/sesiones-comisiones-activas', auth_1.verifyToken, diputado_1.getSesionesComisionesActivas);
router.get('/api/diputado/mi-asistencia/:idAgenda', auth_1.verifyToken, diputado_1.getMiAsistencia);
router.get('/api/diputado/orden-del-dia/:idAgenda', auth_1.verifyToken, diputado_1.getOrdenDelDia);
router.get('/api/diputado/mis-votos/:idAgenda', auth_1.verifyToken, diputado_1.getMisVotos);
exports.default = router;
