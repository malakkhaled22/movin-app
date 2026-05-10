import { Request, Response } from "express";
import Property from "../models/property.model";
import User from "../models/user.model";
import Bid from "../models/bid.model";
import bcrypt from "bcrypt";
import { createNotificationForUser } from "../services/notifications.service";


export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const user = await User.findById(userId).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isSeller) {
            const properties = await Property.find({ seller: userId });
            const propertiesListed = properties.length;
            const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
            const successfulSales = properties.filter(p => p.status === "approved").length;

            return res.status(200).json({
                user,
                stats: {
                    propertiesListed,
                    totalViews,
                    successfulSales
                }
            });
        }

        if (user.isBuyer) {
            const favoritesCount = user.favorites?.length || 0;
            const auctionParticipated = await Bid.distinct("property", { user: userId });
            const searchCount = user.searchHistory?.reduce((sum: number, s: any) => sum + (s.count || 0), 0) || 0;

            return res.status(200).json({
                user,
                stats: {
                    favoritesCount,
                    auctionParticipated: auctionParticipated.length,
                    searchCount
                }
            });
        }
        if ((user as any).isAdmin) {
            const totalUsers = await User.countDocuments();

            const totalProperties = await Property.countDocuments();
            const pendingProperties = await Property.countDocuments({ status: "pending" });
            const approvedProperties = await Property.countDocuments({ status: "approved" });
            const rejectedProperties = await Property.countDocuments({ status: "rejected" });

            const pendingAuctions = await Property.countDocuments({
                status: "approved",
                "auction.isAuction": true,
                "auction.status": "pending"
            });

            const approvedAuctions = await Property.countDocuments({
                status: "approved",
                "auction.isAuction": true,
                "auction.status": "approved"
            });

            return res.status(200).json({
                user,
                stats: {
                    totalUsers,
                    totalProperties,
                    pendingProperties,
                    approvedProperties,
                    rejectedProperties,
                    pendingAuctions,
                    approvedAuctions
                }
            });
        };
        return res.status(400).json({message: "Invalid User Role"});
    } catch (error) {
        console.error("Get Profile Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const { username, phone, location, bio } = req.body;

        const user = await User.findById(userId).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (location) (user as any).location = location;
        if (bio) (user as any).bio = bio;

        await user.save();

        await createNotificationForUser({
            userId: userId.toString(),
            title: "Profile updated ✅",
            body: "Your profile has been updated successfully.",
            type: "alert",
            action: {
                    screen: "Profile",
                    entityId: userId.toString(),
                }
        });
        
        return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Updated Profile Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    }catch(error){
        console.error("Error in changePassword: ", error);
        res.status(500).json({ message: "Failed to change password", error });
    }
};