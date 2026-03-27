import { Router } from "express";
import { actualizarIniciativa, eliminardecreto, getdecretos, getiniciativas, guardardecreto } from "../controllers/iniciativas";
const router = Router();
import  decretos  from "../controllers/filedecretos";

router.get("/api/iniciativas/iniciativas/",getiniciativas );
router.post("/api/iniciativas/savedecreto/",decretos.single("path_doc"), guardardecreto );
router.get("/api/iniciativas/getdecretos/:id",getdecretos );
router.get("/api/iniciativas/eliminardecreto/:id",eliminardecreto );
router.patch('/api/iniciativas/:id', actualizarIniciativa);
export default router