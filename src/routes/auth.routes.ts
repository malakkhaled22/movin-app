import express from "express";
import { loginUser, logoutUser, refreshToken, registerUser, resendVerifyEmailOtp, verifyEmailOtp } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-verify-email", resendVerifyEmailOtp);

router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);

router.post("/logout", verifyToken, logoutUser);
export default router;