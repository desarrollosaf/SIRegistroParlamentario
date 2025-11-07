import { Router } from "express";
import { actualizar, getevento, geteventos, catalogos, getTiposPuntos, guardarpunto, getpuntos, actualizarPunto, eliminarpunto, saveintervencion} from "../controllers/agenda";
import  upload  from "../controllers/multer";
const router = Router();


router.get("/api/eventos/geteventos/", geteventos );
router.get("/api/eventos/getevento/:id", getevento );
router.post("/api/eventos/actasistencia/", actualizar );
router.get("/api/eventos/catalogos/", catalogos );
router.get("/api/eventos/gettipos/:id", getTiposPuntos );
router.post("/api/eventos/savepunto/:id",upload.single("documento"), guardarpunto );
router.get("/api/eventos/getpuntos/:id", getpuntos );
router.post("/api/eventos/actualizarPunto/:id",upload.single("documento"), actualizarPunto );
router.post("/api/eventos/eliminarpunto/:id",eliminarpunto );
router.post("/api/eventos/saveintervencion/", saveintervencion );

export default router