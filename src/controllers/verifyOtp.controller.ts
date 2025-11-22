import { Request, Response } from "express";
import User from "../models/user.model";


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

        //check if OTP matches
        if (user.otpCode !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        //check if OTP expired (after 5 mins)
        const now = new Date();
        if (user.otpExpire && user.otpExpire < now) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        //Mark as verified
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