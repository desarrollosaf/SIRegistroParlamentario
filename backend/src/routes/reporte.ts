import { Router } from "express";
import { getifnini,   getIniciativasEnEstudio, getIniciativasAprobadas, getIniciativasPorGrupoYDiputado, getTotalesPorPeriodo  } from "../controllers/reporte";
const router = Router();


router.get("/api/reporte/iniciativas/general", getifnini);
router.get("/api/reporte/iniciativas/en-estudio", getIniciativasEnEstudio);
router.get("/api/reporte/iniciativas/aprobadas", getIniciativasAprobadas);
router.get("/api/reporte/iniciativas/grupo-diputado", getIniciativasPorGrupoYDiputado);
router.get("/api/reporte/iniciativas/totales-periodo", getTotalesPorPeriodo);

export default router