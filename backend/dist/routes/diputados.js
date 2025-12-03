"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diputados_1 = require("../controllers/diputados");
const router = (0, express_1.Router)();
router.post("/api/diputados/cargo/", diputados_1.cargoDiputados);
exports.default = router;
