import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Property } from "../models/property.model";
import { createNotificationForUser } from "../services/notifications.service";

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const propertyId = req.params.propertyId;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found." });
        }

        const user = await User.findById(userId);
        if (user?.favorites?.some(fav => fav.toString() === propertyId)) {
            return res.status(200).json({ message: "Already in favorites" });
        }

        const update = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favorites: propertyId } },
            { new: true }
        );

        if (property.seller.toString() !== userId.toString()) {
            await createNotificationForUser({
                userId: property.seller.toString(),
                title: "Someone liked your property ❤️",
                body: `${user?.username} added your property in ${property.location} to favorites.`,
                type: "message",
            })
        }


        return res.status(200).json({
            message: "Property added to favorites",
            favorites: update?.favorites
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;
        const propertyId = req.params.propertyId;

        const update = await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: propertyId } },
            { new: true }
        );
        return res.status(200).json({
            message: "Property removed from favorites",
            favorites: update?.favorites
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

export const getAllFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const user = await User.findById(userId)
            .select("favorites")
            .populate("favorites");
            
        if (!user) {
            return res.status(404).json({ message: "User favorites not found." });
        }
        return res.status(200).json({
            favorites: user?.favorites
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

export const clearAllFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { favorites: [] } }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not Found." });
        }
        return res.status(200).json({
            message: "All favorites cleared successfully.",
            favorites: updatedUser.favorites
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};