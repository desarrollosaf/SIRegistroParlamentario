import { Router } from "express";
import { getCatalogos, getCatalogo, saveCategoriaProponente, deleteCategoriaProponente, saveTitularProponente, saveCategoriaInicitavias  } from "../controllers/catalogos";
const router = Router();


router.get("/api/catalogos/getcatalogos/", getCatalogos);
router.get("/api/catalogos/getcatalogo/:id", getCatalogo );
router.post("/api/catalogos/categoriaproponente/save/", saveCategoriaProponente );
router.post("/api/catalogos/categoriaproponente/delete/", deleteCategoriaProponente );
router.post("/api/catalogos/proponentetitular/save/", saveTitularProponente );
router.post("/api/catalogos/categoriainicitiva/save/", saveCategoriaInicitavias );



export default router