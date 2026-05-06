import { Request, Response } from "express"; 
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken";
import { generateOTP } from "../utils/generateOTP";
import { sendEmail } from "../utils/sendEmail";
import { createNotificationForUser } from "../services/notifications.service";
import { logAdminActivity } from "../services/adminActivity.service";
import { hashOtp } from "../utils/hashOtp";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phone } = req.body;
        if (!username || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const otp = generateOTP();
        if(existingUser && !existingUser.isVerified){
            existingUser.username = username;
            existingUser.phone = phone;
            existingUser.password = password;

            existingUser.emailOtpCode = hashOtp(otp);
            existingUser.emailOtpExpire = new Date(Date.now() + 1 * 60 * 1000);

            await existingUser.save();

            await sendEmail(
                existingUser.email,
                "Verify Your Email",
                `Your verification OTP is ${otp}`
            );

            return res.status(200).json({ 
                message: "OTP resent. Please verify your email",
                user: existingUser.email,
            });
        }
        const newUser = new User({
            username,
            email,
            phone,
            password, 
            isAdmin: false,
            isSeller: false,
            isBuyer: false,
            canSwitchRole: true,
            isVerified: false,
            emailOtpCode: hashOtp(otp),
            emailOtpExpire:new Date (Date.now() + 1 * 60 * 1000),
        });
        
        await newUser.save();
        await sendEmail(
            newUser.email,
            "Verify Your Email",
            `Your verification OTP is ${otp}`
        );

        await logAdminActivity({
            type: "user",
            title: "New user registered",
            description: newUser.email,
            icon: "user"
        });

        res.status(201).json({
            message: "User registered successfully, Please verify your email",
            user: newUser.email,
        });
        console.log(`✅ OTP for ${newUser.email}: ${otp}`);
    } catch (error) {
        console.error("❌ Error in Register User:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const verifyEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if(user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (!user.emailOtpCode || !user.emailOtpExpire) 
        return res.status(400).json({ message: "No OTP found, please request again" });

    const now = new Date();
    if(user.emailOtpExpire < now) return res.status(400).json({ message: "OTP has expired" });

    const hashedOtp = hashOtp(otp);
    if(user.emailOtpCode !== hashedOtp) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.emailOtpCode = undefined;
    user.emailOtpExpire = undefined;

    const { accessToken, refreshToken } = generateToken({
        _id: user.id.toString(),
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        isBuyer: user.isBuyer,
    });

    user.refreshToken = refreshToken;
    await user.save();

    await createNotificationForUser({
        userId: user.id.toString(),
        title: "Account Verified ✅",
        body: "Your email has been verified successfully. You can now use all features.",
        type: "alert",
        action: {
            screen: "Profile",
            entityId: user.id.toString(),
        }
    });

    res.status(200).json({ message: "Email verified successfully",
        accessToken,
        refreshToken,
        user: {
                id: user._id,
                name: user.username,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                isBuyer: user.isBuyer,
            }
    });
    } catch (error) {
        console.error("Error in verify email otp", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resendVerifyEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: "User not found" });
        if(user.isVerified) return res.status(400).json({ message: "Email already verified" });

        const now = new Date();

        if(user.emailOtpLastSentAt && now.getTime() - user.emailOtpLastSentAt.getTime() < 60000){
            return res.status(429).json({message: "Please wait 1 minute before requesting a new OTP" });
        }
        if(user.emailOtpExpire && user.emailOtpExpire > now){
            return res.status(400).json({ message: "OTP is still valid, please wait until it expires"});
        }
        const otp = generateOTP();
        user.emailOtpCode = hashOtp(otp);
        user.emailOtpExpire = new Date(Date.now() + 5 * 60 * 1000);
        user.emailOtpLastSentAt = now;

        await user.save();
        await sendEmail (
            user.email,
            "Verify Your Email",
            `Your new verification OTP is: ${otp}. It expires in 5 minutes.`
        );

        return res.status(200).json({ message: "verification OTP resent successfully" });
    } catch (error) {
        console.error("Error in resendVerifyEmailOtp: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }
        if(user.isBlocked) return res.status(403).json({ message: "Your account is blocked" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const { accessToken, refreshToken } = generateToken({
            _id: String(user._id),
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
            isBuyer: user.isBuyer,
        });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                isBuyer: user.isBuyer,
            },
        });
    } catch (err) {
        console.error("Error in login: ", err);
        res.status(500).json({ message: "Server error", err });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) return res.status(401).json({ message: "No refresh token found"});

        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);

        const user = await User.findById(decoded._id);
        if(!user) return res.status(401).json({ message: "User not found" });

        if(user.refreshToken !== refreshToken) 
            return res.status(401).json({ message: "Invalid refresh token"});

        const { accessToken } = generateToken({
            _id: user.id.toString(),
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
            isBuyer: user.isBuyer,
        });
        return res.status(200).json({ accessToken: accessToken });
    } catch (error) {
        return res.status(401).json({message: "Refresh token expired or invalid"});
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        if(!req.user) return res.status(401).json({ message: "Unauthorized" });
        const user= await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });
        
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", error });
    }
};