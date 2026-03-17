"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const iniciativas_1 = require("../controllers/iniciativas");
const router = (0, express_1.Router)();
const filedecretos_1 = __importDefault(require("../controllers/filedecretos"));
router.get("/api/iniciativas/iniciativas/", iniciativas_1.getiniciativas);
router.post("/api/iniciativas/savedecreto/:id", filedecretos_1.default.single("documento"), iniciativas_1.guardardecreto);
router.get("/api/iniciativas/getdecretos/:id", iniciativas_1.getdecretos);
exports.default = router;
