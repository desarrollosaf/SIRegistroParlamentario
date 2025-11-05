import { Router } from "express";
import { actualizar, getevento, geteventos, crearordendia, getTiposPuntos} from "../controllers/agenda";

const router = Router();


router.get("/api/eventos/geteventos/", geteventos );
router.get("/api/eventos/getevento/:id", getevento );
router.post("/api/eventos/actasistencia/", actualizar );
router.get("/api/eventos/ordendia/:id", crearordendia );
router.get("/api/eventos/gettipos/:id", getTiposPuntos );

export default router