import { Router } from "express";
import {
  getifnini,
  getIniciativasEnEstudio,
  getIniciativasAprobadas,
  getIniciativasPorGrupoYDiputado,
  getTotalesPorPeriodo,
  getReporteIniciativasIntegrantes,
  getIniciativasTurnadasComision,
  getPeriodosLegislativos,
  crearPeriodoLegislativo,
  getReportePorPeriodoLegislativo
} from "../controllers/reporte";

const router = Router();

router.get("/api/reporte/iniciativas/general", getifnini);
router.get("/api/reporte/iniciativas/en-estudio", getIniciativasEnEstudio);
router.get("/api/reporte/iniciativas/aprobadas", getIniciativasAprobadas);
router.get("/api/reporte/iniciativas/grupo-diputado", getIniciativasPorGrupoYDiputado);
router.get("/api/reporte/iniciativas/totales-periodo", getTotalesPorPeriodo);
router.post("/api/reporte/iniciativas/integrantes", getReporteIniciativasIntegrantes);
router.get("/api/reporte/iniciativas/inicomisions", getIniciativasTurnadasComision);

// Periodos legislativos
router.get("/api/reporte/iniciativas/periodos-legislativos", getPeriodosLegislativos);
router.post("/api/reporte/iniciativas/periodos-legislativos", crearPeriodoLegislativo);
router.post("/api/reporte/iniciativas/por-periodo", getReportePorPeriodoLegislativo);

export default router;