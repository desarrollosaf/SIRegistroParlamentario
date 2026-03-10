import { Router } from "express";
import { getifnini,  } from "../controllers/reporte";
const router = Router();



router.get("/api/reporte/getinfiniciativas/", getifnini);

export default router