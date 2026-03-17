"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const iniciativas_1 = require("../controllers/iniciativas");
const router = (0, express_1.Router)();
router.get("/api/iniciativas/iniciativas/", iniciativas_1.getiniciativas);
exports.default = router;
