import { Request, Response } from "express"; 
import { User } from "../models/user.model";



export const chooseRole = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: "Role is required" });
        }

        const newRole = role.toLowerCase();

        if (!["buyer", "seller"].includes(newRole)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isBuyer || user.isSeller) {
            return res.status(400).json({ message: "Role already selected!, use switch instead." });
        }

        user.isBuyer = newRole === "buyer";
        user.isSeller = newRole === "seller";

        await user.save();

        return res.status(200).json({
            message: `Role successfully chosen: ${newRole}`
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};


export const switchRole = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id; // from token
        const { newRole } = req.body;

        if (!newRole) {
            return res.status(400).json({ message: "New role is required" });
        }

        const role = newRole.toLowerCase();

        if (!["buyer", "seller"].includes(role)) {
            return res.status(400).json({ message: "Invalid role!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (!user.canSwitchRole) {
            return res.status(403).json({ message: "You cannot switch roles" });
        }
        
        if (!user.isBuyer && !user.isSeller) {
            return res.status(400).json({ message: "No role selected yet, use chooseRole first" });
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