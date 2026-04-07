import { Router } from "express";
import { getEventosPorComision, getIniciativasPresentadasPorDiputado, getIniciativasTurnadasPorComision, getResumenTotalesEndpoint  } from "../controllers/estadistico";
const router = Router();


router.get("/api/estadistico/iniciativas/resumen", getResumenTotalesEndpoint);
router.get("/api/estadistico/diputado/iniciativas", getIniciativasPresentadasPorDiputado );
router.get("/api/estadistico/comision/iniciativas", getIniciativasTurnadasPorComision );
router.get("/api/estadistico/comision/eventos", getEventosPorComision );

export default router