import { Router } from "express";
import { actualizar, getevento, geteventos } from "../controllers/agenda";

const router = Router();


router.get("/api/eventos/geteventos/", geteventos );
router.get("/api/eventos/getevento/:id", getevento );
router.post("/api/eventos/actasistencia/", actualizar );

export default router