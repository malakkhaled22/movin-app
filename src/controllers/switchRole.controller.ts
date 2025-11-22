import { Request, Response } from "express"; 
import { User } from "../models/user.model";

export const switchRole = async (req: Request, res: Response) => {
    try {
        const { userId, newRole } = req.body;
        const role = newRole.toLowerCase();

        if (!["buyer", "seller"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user?.canSwitchRole) {
            return res.status(403).json({ message: "You cannot switch roles" });
        }

        if ((role === "buyer" && user.isBuyer) || (role === "seller" && user.isSeller)) {
            return res.status(400).json({ message: `You are already a ${role}` });
        }
        
        user.isBuyer = role === "buyer";
        user.isSeller = role === "seller";

        await user.save();

        res.status(200).json({
            message: `Role switched to ${role} successfully`,
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};