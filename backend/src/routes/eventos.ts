import { Router } from "express";
import { geteventos } from "../controllers/agenda";

const router = Router();


router.get("/api/eventos/geteventos/", geteventos );

export default router