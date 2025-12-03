import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Property } from "../models/property.model";
import mongoose from "mongoose";


export const favoriteToggle = async (req: Request, res: Response) => {

    try {
        const userId = (req as any).user._id;
        const propertyId = new mongoose.Types.ObjectId(req.params.propertyId);

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isExist = user.favorites?.includes(propertyId);

        if (isExist) {
            //remove
            user.favorites = user.favorites?.filter(
                (id) => id.toString() !== propertyId.toString() 
            );

            await user.save();
            return res.status(200).json({
                favorited: false,
                message: "Property removed successfully from favorites."
            });
        } else {
            //add
            user.favorites?.push(propertyId);

            await user.save();
            return res.status(200).json({
                favorited: true,
                message:"Property added successfully to favorites."
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
}