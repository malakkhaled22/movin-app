import express from "express";
import { resetPassword, sendOtp, verifyOtp } from "../controllers/authOtp.controller";
import { resendOtp } from "../controllers/authOtp.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();


router.post("/forgot-password", verifyToken, sendOtp);

router.post("/verify-otp", verifyToken, verifyOtp);

router.post("/reset-password", verifyToken, resetPassword);

router.post("/resend-otp", verifyToken, resendOtp);

export default router;