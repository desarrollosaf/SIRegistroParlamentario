"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multerProyeccion_1 = __importDefault(require("../controllers/multerProyeccion"));
const proyeccion_1 = require("../controllers/proyeccion");
const router = (0, express_1.Router)();
// Subida de archivo (imagen/video) con manejo de errores de multer.
router.post('/api/proyeccion/upload', (req, res, next) => {
    multerProyeccion_1.default.single('archivo')(req, res, (err) => {
        if (err)
            return res.status(400).json({ msg: err.message });
        next();
    });
}, proyeccion_1.subirArchivoProyeccion);
// Composiciones guardadas.
router.get('/api/proyeccion/guardadas/:comisionId', proyeccion_1.listarGuardadas);
router.post('/api/proyeccion/guardadas', proyeccion_1.guardarComposicion);
router.delete('/api/proyeccion/guardadas/:id', proyeccion_1.eliminarComposicion);
exports.default = router;
