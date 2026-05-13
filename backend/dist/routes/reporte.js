"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporte_1 = require("../controllers/reporte");
const router = (0, express_1.Router)();
router.get("/api/reporte/iniciativas/general", reporte_1.getifnini);
router.get("/api/reporte/iniciativas/en-estudio", reporte_1.getIniciativasEnEstudio);
router.get("/api/reporte/iniciativas/aprobadas", reporte_1.getIniciativasAprobadas);
router.get("/api/reporte/iniciativas/grupo-diputado", reporte_1.getIniciativasPorGrupoYDiputado);
router.get("/api/reporte/iniciativas/totales-periodo", reporte_1.getTotalesPorPeriodo);
router.post("/api/reporte/iniciativas/integrantes", reporte_1.getReporteIniciativasIntegrantes);
router.get("/api/reporte/iniciativas/inicomisions", reporte_1.getIniciativasTurnadasComision);
// Periodos legislativos
router.get("/api/reporte/iniciativas/periodos-legislativos", reporte_1.getPeriodosLegislativos);
router.post("/api/reporte/iniciativas/periodos-legislativos", reporte_1.crearPeriodoLegislativo);
router.post("/api/reporte/iniciativas/por-periodo", reporte_1.getReportePorPeriodoLegislativo);
// Asistencia por diputado
router.get("/api/reporte/asistencia/diputados", reporte_1.getDiputadosAsistencia);
router.get("/api/reporte/asistencia/comisiones/:diputado_id", reporte_1.getComisionesDiputadoAsistencia);
router.post("/api/reporte/asistencia/por-diputado", reporte_1.getReporteAsistenciaDiputado);
router.post("/api/reporte/asistencia/datos-diputado", reporte_1.getDatosAsistenciaDiputado);
exports.default = router;
