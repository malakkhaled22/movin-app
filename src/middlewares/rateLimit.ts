import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: {
        message: "Too many OTP requests. Please try again after 1 minute."
    },
    standardHeaders: true,
    legacyHeaders: false,
});