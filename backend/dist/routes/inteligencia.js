"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inteligencia_1 = require("../controllers/inteligencia");
const router = (0, express_1.Router)();
router.get('/api/inteligencia/morena/integrantes/', inteligencia_1.getIntegrantesMorena);
router.get('/api/inteligencia/verde/integrantes/', inteligencia_1.getIntegrantesVerde);
exports.default = router;
