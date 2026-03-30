import { Router } from "express";
import { actualizarIniciativa, eliminardecreto, getdecretos, getiniciativas, guardardecreto, publicarAgenda } from "../controllers/iniciativas";
const router = Router();
import  decretos  from "../controllers/filedecretos";

router.get("/api/iniciativas/iniciativas/",getiniciativas );
router.post("/api/iniciativas/savedecreto/",decretos.single("path_doc"), guardardecreto );
router.get("/api/iniciativas/getdecretos/:id",getdecretos );
router.get("/api/iniciativas/eliminardecreto/:id",eliminardecreto );
router.patch('/api/iniciativas/publicarini/:id', actualizarIniciativa);
router.patch('/api/iniciativas/publicarevento/:id', publicarAgenda);
export default router