import express from "express";
import { otpLimiter } from "../middlewares/rateLimit";
import { sendOtp } from "../controllers/authOtp.controller";
import { verifyOtp } from "../controllers/verifyOtp.controller";
import { resetPassword } from "../controllers/resetPassword.controller";
import { resendOtp } from "../controllers/authOtp.controller";

const router = express.Router();


//1- send-otp
router.post("/forgot-password", otpLimiter, sendOtp);
//2- verify-otp
router.post("/verify-otp", verifyOtp);
//3- reset-password
router.post("/reset-password", resetPassword);
//resend-otp
router.post("/resend-otp", otpLimiter, resendOtp);

export default router;