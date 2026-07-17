"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const uploadDir = path_1.default.join(__dirname, "../../storage/proyeccion");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto_1.default.randomUUID()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// Acepta imágenes y videos, hasta 200 MB.
exports.default = (0, multer_1.default)({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Solo se permiten imágenes o videos"));
        }
    },
});
