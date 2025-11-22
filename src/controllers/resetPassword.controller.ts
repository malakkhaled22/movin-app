import { Request, Response } from "express";
import { User } from "../models/user.model";

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