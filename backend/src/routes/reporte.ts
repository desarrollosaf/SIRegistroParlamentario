import { Router } from "express";
import { getifnini,   getIniciativasEnEstudio, getIniciativasAprobadas, getIniciativasPorGrupoYDiputado, getTotalesPorPeriodo, getReporteIniciativasIntegrantes, getIniciativasTurnadasComision  } from "../controllers/reporte";
const router = Router();


router.get("/api/reporte/iniciativas/general", getifnini);
router.get("/api/reporte/iniciativas/en-estudio", getIniciativasEnEstudio);
router.get("/api/reporte/iniciativas/aprobadas", getIniciativasAprobadas);
router.get("/api/reporte/iniciativas/grupo-diputado", getIniciativasPorGrupoYDiputado);
router.get("/api/reporte/iniciativas/totales-periodo", getTotalesPorPeriodo);
router.post("/api/reporte/iniciativas/integrantes", getReporteIniciativasIntegrantes);
router.get("/api/reporte/iniciativas/inicomisions", getIniciativasTurnadasComision);

export default router