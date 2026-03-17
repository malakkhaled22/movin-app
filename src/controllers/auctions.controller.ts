import { Request, Response } from "express";
import Property from "../models/property.model";
import Bid from "../models/bid.model";

export const getAuctionDetails = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId);

        if (!property) return res.status(404).json({ message: "Property not found" });

        const bids = await Bid.find({ property: propertyId })
            .populate("user", "username")
            .sort({ amount: -1 })
            .limit(10);
        
        const now = new Date();
        const timeRemaining = property.auction?.endTime ? property.auction.endTime.getTime() - now.getTime() : 0;

        return res.json({
            property,
            currentBid: property.auction?.currentBid,
            startPrice: property.auction?.startPrice,
            totalBids: property.auction?.totalBids,
            timeRemaining,
            bidHistory: bids
        });
    } catch (error) {
        console.error("Error in Auction ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};