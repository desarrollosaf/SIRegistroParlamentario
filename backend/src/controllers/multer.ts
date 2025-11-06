import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto"; 

const uploadDir = path.join(__dirname, "../../storage/puntos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export default multer({ storage }); 