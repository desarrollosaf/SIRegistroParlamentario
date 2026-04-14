import { Router } from "express";
import { getasistencia, geteventos, getEventosPorComision, getIniciativasPresentadasPorDiputado, getIniciativasTurnadasPorComision, getResumenTotalesEndpoint, getVotosCierre  } from "../controllers/estadistico";
const router = Router();


router.get("/api/estadistico/iniciativas/resumen", getResumenTotalesEndpoint);
router.get("/api/estadistico/diputado/iniciativas", getIniciativasPresentadasPorDiputado );
router.get("/api/estadistico/comision/iniciativas", getIniciativasTurnadasPorComision );
router.get("/api/estadistico/comision/eventos", getEventosPorComision );
router.get("/api/estadistico/getvotospunto/:id", getVotosCierre );
// router.get('/api/iniciativas/votos-cierre/:id/', getVotosCierre);
router.get("/api/estadistico/geteventos/", geteventos );
router.get("/api/estadistico/getasistencia/:id", getasistencia );

export default router