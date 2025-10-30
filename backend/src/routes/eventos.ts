import { Router } from "express";
import { getevento, geteventos } from "../controllers/agenda";

const router = Router();


router.get("/api/eventos/geteventos/", geteventos );
router.get("/api/eventos/getevento/:id", getevento );

export default router