import express from "express";
import { resetPassword, sendOtp, verifyOtp } from "../controllers/authOtp.controller";
import { resendOtp } from "../controllers/authOtp.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();


router.post("/forgot-password", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

router.post("/resend-otp", resendOtp);

export default router;