import { Request, Response } from "express"; 
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!username || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        //Check is the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        //create new User
        const newUser = new User({
            username,
            email,
            phone,
            password, 
            isAdmin: false,
            isSeller: false,
            isBuyer: false,
            canSwitchRole: true
        });
        
        await newUser.save();
        const token = generateToken({
            _id: String(newUser._id),
            isAdmin: newUser.isAdmin,
            isSeller: newUser.isSeller,
            isBuyer: newUser.isBuyer,
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        });
    } catch (error) {
        console.error("❌ Error in Register User:", error);
        res.status(500).json({ message: "Server error", error });
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

        console.log("📌 User found:", user.password);
        console.log("📌 Entered password:", password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔹 Raw entered password:", password);
        console.log("🔹 Hashed password in DB:", user.password);
        console.log("🔹 Compare result:", isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            _id: String(user._id),
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
            isBuyer: user.isBuyer,
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
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
        res.status(500).json({message: "Server error",err});
    }
}