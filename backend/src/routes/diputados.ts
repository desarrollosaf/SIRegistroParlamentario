import { Router } from "express";
import { actualizartodos, actvototodos, cargoDiputados, creariniciativa, eliminariniciativa, getiniciativas } from "../controllers/diputados";
const router = Router();


router.post("/api/diputados/cargo/", cargoDiputados);
router.post("/api/diputados/acttodosasistencia/", actualizartodos );
router.post("/api/diputados/acttodosvotos/", actvototodos );
router.post("/api/diputados/saveiniciativa/", creariniciativa);
router.get("/api/diputados/eliminariniciativa/:id",eliminariniciativa );
router.get("/api/diputados/getiniciativas/:id",getiniciativas );


export default router