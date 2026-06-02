"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inteligencia_1 = require("../controllers/inteligencia");
const router = (0, express_1.Router)();
router.get('/api/inteligencia/:slug/integrantes/', inteligencia_1.getIntegrantesPartido);
exports.default = router;
