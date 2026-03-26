"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estadistico_1 = require("../controllers/estadistico");
const router = (0, express_1.Router)();
router.get("/api/estadistico/iniciativas/resumen", estadistico_1.getResumenTotalesEndpoint);
router.get("/api/estadistico/diputado/iniciativas", estadistico_1.getIniciativasPresentadasPorDiputado);
router.get("/api/estadistico/comision/iniciativas", estadistico_1.getIniciativasTurnadasPorComision);
exports.default = router;
