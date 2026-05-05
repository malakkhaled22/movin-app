import { Request, Response } from "express";
import User from "../models/user.model";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";
import { hashOtp } from "../utils/hashOtp";
import bcrypt from "bcryptjs";

export const sendResetPasswordOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if(!user.isVerified) return res.status(403).json({ message: "Verify your email first" });
        
        const now = new Date();

        if(user.resetOtpLastSentAt && now.getTime() - user.resetOtpLastSentAt.getTime() < 60000){
            return res.status(429).json({
                message: "Please wait 1 minute before requesting another OTP",
            });
        }

        const otp = generateOTP();

        user.resetOtpCode = hashOtp(otp);
        user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000); 
        user.passwordResetVerification = false;
        user.resetOtpLastSentAt = now;

        await user.save();

        const message = `Your Movin password reset code is: ${otp}. It expires in 5 minutes.`;
        await sendEmail(user.email, "Movin Password Reset Code", message);

        res.status(200).json({ message: "OTP sent successfully" });
        console.log(`✅ OTP for ${user.email}: ${otp}`);
    } catch (error) {
        console.error("❌ Error in SendResetPasswordOTP: ", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

export const resendResetPasswordOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if(!user.isVerified) return res.status(403).json({ message: "Verify your email first" });

        const now = new Date();
        
        if(user.resetOtpLastSentAt && now.getTime() - user.resetOtpLastSentAt.getTime() < 60000){
            return res.status(429).json({
                message: "Please wait 1 minute before requesting another OTP",
            });
        }
        if(user.resetOtpExpire && user.resetOtpExpire > now){
            return res.status(400).json({ message: "OTP is still valid, please wait until it expires"});
        }
        const newOtp = generateOTP();
        
        user.resetOtpCode = hashOtp(newOtp);
        user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);
        user.passwordResetVerification = false;
        user.resetOtpLastSentAt = now;

        await user.save();

        const message = `Your new Movin password reset code is: ${newOtp}. It expires in 5 minutes.`;
        await sendEmail(user.email, "Resent Movin Password Reset Code", message);

        res.status(200).json({ message: "OTP resent successfully" });
        console.log(`🔁 NEW OTP for ${user.email}: ${newOtp}`);
    } catch (error) {
        console.error("Error in resendOtp:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const verifyResetPasswordOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.resetOtpCode || !user.resetOtpExpire) {
            return res.status(400).json({ message: "No OTP found, please request again" });
        }

        const now = new Date();
        if (user.resetOtpExpire && user.resetOtpExpire < now) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        const hashedOtp = hashOtp(otp);
        if(user.resetOtpCode !== hashedOtp) return res.status(400).json({ message: "Invalid OTP" });

        user.passwordResetVerification = true;
        user.resetOtpCode = undefined;
        user.resetOtpExpire = undefined;
        user.resetOtpLastSentAt = undefined;

        await user.save();
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error in verifyResetPasswordOtp:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.passwordResetVerification) {
            return res.status(403).json({ message: "OTP not verified" });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if(isSamePassword) 
            return res.status(400).json({ message: "New password cannot be the same as old password, try new one "});
        user.password = newPassword;
        user.passwordResetVerification = false;
        user.resetOtpCode = undefined;
        user.resetOtpExpire = undefined;
        user.resetOtpLastSentAt = undefined;

        await user.save();
        
        return res.status(200).json({
            message: "Password has been reset successfully ✅",
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Server error", error }); 
    }
};