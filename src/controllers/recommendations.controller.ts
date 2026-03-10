import Property from "../models/property.model";
import User from "../models/user.model";
import { Request, Response } from "express";



export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)._id;

        const user = await User.findById(userId).populate("favorites");
        if (!user) return res.status(404).json({ message: "User not found" });

        const favorites = user.favorites as any[];

        //No favs => Most viewed
        if (favorites.length === 0) {
            const popular = await Property.find({ status: "approved" })
                .sort({ views: -1 })
                .limit(10);
            return res.status(200).json({ popular });
        }

        const favsIds = favorites.map(f => f._id);

        const properties = await Property.find({
            status: "approved",
            _id: { $nin: favsIds }
        }).limit(50);

        const results = properties.map(property => {
            let score = 0;

            favorites.forEach(fav => {
                //same type
                if (fav.type === property.type)
                    score += 0.3;

                //same listing type => sale or rent
                if (fav.listingType === property.listingType)
                    score += 0.3;

                //same location
                if (fav.location === property.location)
                    score += 0.3;

                //similarity price
                const priceDiff = Math.abs(fav.price - property.price) / fav.price;
                score += Math.max(0, 0.2 - priceDiff * 0.2);

                //similarity bedrooms or bathrooms
                if (fav.details?.bedrooms === property.details?.bedrooms || fav.details?.bathrooms === property.details?.bathrooms)
                    score += 0.2;
            });
            //popularity boost
            if (property.views > 20)
                score += 0.1;

            return {
                ...property.toObject(),
                score
            };
        });

        results.sort((a, b) => b.score - a.score);

        return res.json(results.slice(0, 10));
    } catch (error) {
        console.error("Recommendation System Error: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};