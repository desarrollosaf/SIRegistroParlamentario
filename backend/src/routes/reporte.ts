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
  getReportePorPeriodoLegislativo,
  getDiputadosAsistencia,
  getComisionesDiputadoAsistencia,
  getReporteAsistenciaDiputado,
  getDatosAsistenciaDiputado
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

// Asistencia por diputado
router.get("/api/reporte/asistencia/diputados", getDiputadosAsistencia);
router.get("/api/reporte/asistencia/comisiones/:diputado_id", getComisionesDiputadoAsistencia);
router.post("/api/reporte/asistencia/por-diputado", getReporteAsistenciaDiputado);
router.post("/api/reporte/asistencia/datos-diputado", getDatosAsistenciaDiputado);

export default router;