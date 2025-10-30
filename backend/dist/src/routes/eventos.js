"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agenda_1 = require("../controllers/agenda");
const router = (0, express_1.Router)();
router.get("/api/eventos/geteventos", agenda_1.geteventos);
exports.default = router;
