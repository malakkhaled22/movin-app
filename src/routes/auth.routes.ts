import express from "express";
import { loginUser, logoutUser, registerUser, verifyEmailOtp } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email",verifyToken, verifyEmailOtp);

router.post("/login", loginUser);

router.post("/logout", verifyToken, logoutUser);
export default router;