import { Router } from "express";
import { actualizartodos, actvototodos, cargoDiputados } from "../controllers/diputados";
const router = Router();


router.post("/api/diputados/cargo/", cargoDiputados);
router.post("/api/diputados/acttodosasistencia/", actualizartodos );
router.post("/api/diputados/acttodosvotos/", actvototodos );

export default router