import { Request, Response } from "express";
import User from "../models/user.model";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();

        user.otpCode = otp;
        user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); //5mins
        await user.save();

        //send otp via email
        const message = `Your Movin password reset code is: ${otp}. It expires in 5 minutes.`;
        await sendEmail(user.email, "Movin Password Reset Code", message);

        res.status(200).json({ message: "OTP sent successfully" });
        console.log(`✅ OTP for ${user.email}: ${otp}`);
    } catch (error) {
        console.error("❌ Error in sendOTP: ", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { email }=req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();
        if (user.otpExpire && user.otpExpire > now) {
            return res.status(400).json({
                message: "An OTP has already been sent. Please wait until it expires"
            });
        }

        const newOtp = generateOTP();
        user.otpCode = newOtp;
        user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        const message = `Your new Movin password reset code is: ${newOtp}. It expires in 5 minutes.`;
        await sendEmail(user.email, "Movin Password Reset Code(Resent)", message);

        res.status(200).json({ message: "OTP resent successfully" });
        console.log(`🔁 NEW OTP for ${user.email}: ${newOtp}`);
    } catch (error) {
        console.error("❌ Error in resendOtp:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const now = new Date();
        if (user.otpExpire && user.otpExpire < now) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verified OTP", error);
        res.status(500).json({ message: "Internal server error" });
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
        if (!user.isVerified) {
            return res.status(403).json({ message: "User not verified with OTP" });
        }
        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        user.isVerified = false;

        await user.save();
        return res.status(200).json({
            message: "Password has been reset successfully ✅",
        });
    } catch (error) {
        console.error("❌ Error in resetPassword:", error);
        res.status(500).json({ message: "Server error", error }); 
    }
};