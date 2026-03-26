import { Router } from "express";
import { getIniciativasPresentadasPorDiputado, getIniciativasTurnadasPorComision, getResumenTotalesEndpoint  } from "../controllers/estadistico";
const router = Router();


router.get("/api/estadistico/iniciativas/resumen", getResumenTotalesEndpoint);
router.get("/api/estadistico/diputado/iniciativas", getIniciativasPresentadasPorDiputado );
router.get("/api/estadistico/comision/iniciativas", getIniciativasTurnadasPorComision );

export default router