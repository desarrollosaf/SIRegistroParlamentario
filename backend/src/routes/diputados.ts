import { Router } from "express";
import { cargoDiputados } from "../controllers/diputados";
const router = Router();


router.post("/api/diputados/cargo/", cargoDiputados);

export default router