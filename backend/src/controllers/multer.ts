import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/puntos"));
  },
  filename: async (req, file, cb) => {
    const { v4: uuidv4 } = await import('uuid'); // 👈 import dinámico
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export default multer({ storage });
