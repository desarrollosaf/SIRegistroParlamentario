import { Router } from "express";
import { getCurrentUser, LoginUser, cerrarsesion, ReadUser, ChangePassword } from "../controllers/users";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/api/user/login", LoginUser);
router.get("/api/user/getusers", verifyToken, ReadUser);
router.get("/api/user/me", verifyToken, getCurrentUser);
router.post("/api/user/change-password", verifyToken, ChangePassword);
router.post('/api/user/cerrarsesion',  cerrarsesion);

export default router;
