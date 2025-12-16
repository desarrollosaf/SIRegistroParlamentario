import { Router } from "express";
import { getCatalogos, getCatalogo, saveCategoriaProponente, deleteCategoriaProponente } from "../controllers/catalogos";
const router = Router();


router.get("/api/catalogos/getcatalogos/", getCatalogos);
router.get("/api/catalogos/getcatalogo/:id", getCatalogo );
router.post("/api/catalogos/categoriaproponente/save/", saveCategoriaProponente );
router.post("/api/catalogos/categoriaproponente/delete/", deleteCategoriaProponente );



export default router