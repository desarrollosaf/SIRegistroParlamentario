"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agenda_1 = require("../controllers/agenda");
const multer_1 = __importDefault(require("../controllers/multer"));
const router = (0, express_1.Router)();
router.get("/api/eventos/geteventos/", agenda_1.geteventos);
router.get("/api/eventos/getevento/:id", agenda_1.getevento);
router.post("/api/eventos/actasistencia/", agenda_1.actualizar);
router.get("/api/eventos/catalogos/", agenda_1.catalogos);
router.get("/api/eventos/gettipos/:id", agenda_1.getTiposPuntos);
router.post("/api/eventos/savepunto/:id", multer_1.default.single("documento"), agenda_1.guardarpunto);
exports.default = router;
