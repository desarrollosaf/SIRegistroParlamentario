import { Router } from "express";
import { actualizartodos, cargoDiputados } from "../controllers/diputados";
const router = Router();


router.post("/api/diputados/cargo/", cargoDiputados);
router.post("/api/diputados/acttodosasistencia/", actualizartodos );

export default router