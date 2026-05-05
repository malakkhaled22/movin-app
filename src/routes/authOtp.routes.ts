import express from "express";
import { resetPassword, sendResetPasswordOtp, verifyResetPasswordOtp, } from "../controllers/authOtp.controller";
import { resendResetPasswordOtp } from "../controllers/authOtp.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();


router.post("/forgot-password", sendResetPasswordOtp);

router.post("/verify-otp", verifyResetPasswordOtp);

router.post("/resend-reset-otp", resendResetPasswordOtp);

router.post("/reset-password", resetPassword);

export default router;