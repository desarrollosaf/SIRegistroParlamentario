import { Router } from "express";
import { getiniciativas } from "../controllers/iniciativas";
const router = Router();

router.get("/api/iniciativas/iniciativas/",getiniciativas );
export default router