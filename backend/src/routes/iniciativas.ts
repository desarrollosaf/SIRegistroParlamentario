import { Router } from "express";
import { getdecretos, getiniciativas, guardardecreto } from "../controllers/iniciativas";
const router = Router();
import  decretos  from "../controllers/filedecretos";

router.get("/api/iniciativas/iniciativas/",getiniciativas );
router.post("/api/iniciativas/savedecreto/:id",decretos.single("documento"), guardardecreto );
router.get("/api/iniciativas/getdecretos/:id",getdecretos );
export default router