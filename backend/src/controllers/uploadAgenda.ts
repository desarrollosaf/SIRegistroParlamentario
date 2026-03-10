import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const uploadPath = path.join(process.cwd(), "storage", "agendas");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const uploadAgenda = multer({ storage });

export default uploadAgenda;