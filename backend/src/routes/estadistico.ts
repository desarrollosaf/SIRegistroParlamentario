import { Router } from "express";
import { getIniciativasPresentadasPorDiputado, getResumenTotalesEndpoint  } from "../controllers/estadistico";
const router = Router();


router.get("/api/estadistico/iniciativas/resumen", getResumenTotalesEndpoint);
router.get("/api/estadistico/diputado/iniciativas", getIniciativasPresentadasPorDiputado );

export default router