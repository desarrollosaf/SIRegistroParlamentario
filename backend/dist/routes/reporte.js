"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporte_1 = require("../controllers/reporte");
const router = (0, express_1.Router)();
router.get("/api/reporte/getinfiniciativas/", reporte_1.getifnini);
exports.default = router;
