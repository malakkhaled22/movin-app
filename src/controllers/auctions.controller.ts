import { Request, Response } from "express";
import Property from "../models/property.model";
import Bid from "../models/bid.model";

const getAuctionStatus = (endTime?: Date) => {
    if (!endTime) return "ended";

    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return "ended";
    
    const TWO_HOUR = 120 * 60 * 1000;
    if (diff <= TWO_HOUR) return "endingSoon";
    return "live";
};

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
        
        const timeRemaining = property.auction?.endTime
            ? Math.max(0, property.auction.endTime.getTime() - now.getTime()) : 0;
        
            return res.json({
            property,
            currentBid: property.auction?.currentBid,
            startPrice: property.auction?.startPrice,
            totalBids: property.auction?.totalBids,
            timeRemaining,
            status: getAuctionStatus(property.auction?.endTime),
            bidHistory: bids
        });
    } catch (error) {
        console.error("Error in Auction Details", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllAuctionProperties = async (req: Request, res: Response) => {
    try {
    const now = new Date();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
        "auction.isAuction": true,
        status: "approved"
    };

    const totalAuctions = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
        .populate("seller", "username")
        .select("description location images auction seller type listingType size views")
        .sort({ "auction.endTime": 1 })
        .skip(skip)
        .limit(limit);

    const auctions = properties.map((p) => ({
        _id: p._id,
        description: p.description,
        location: p.location,
        image: p.images?.[0]?.url || null,

        startPrice: p.auction?.startPrice || 0,
        currentBid: p.auction?.currentBid || p.auction?.startPrice || 0,
        totalBids: p.auction?.totalBids || 0,
        endTime: p.auction?.endTime,
        status: getAuctionStatus(p.auction?.endTime),

        seller: p.seller,
        type: p.type,
        listingType: p.listingType,
        size: p.size,
        views: p.views
    }));

    const TWO_HOUR = 120 * 60 * 1000;
    const endingSoon = await Property.countDocuments({
        ...filter,
        "auction.endTime": 
        { $gt: now, 
        $lte: new Date(now.getTime() + TWO_HOUR) 
        }
    });

    const totalBidsAgg = await Property.aggregate([
        { $match: filter },
        { $group: { _id: null, totalBids: { $sum: "$auction.totalBids" } } }
    ]);

    const totalBids = totalBidsAgg[0]?.totalBids || 0;

    return res.status(200).json({
        success: true,
        summary: {
        activeAuctions: totalAuctions,
        endingSoon,
        totalBids
        },
        pagination: {
        page,
        limit,
        totalAuctions,
        totalPages: Math.ceil(totalAuctions / limit)
        },
        auctions
        });
    } catch (error) {
        console.error("Error in Auction Details", error);
        return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
};

export const createAuctionForProperty = async (req: Request ,res: Response) => {
    try {
        const sellerId = (req.user as any)._id;
        const {propertyId} = req.params;
        const {startPrice, startTime, endTime} = req.body;

        const property = await Property.findById(propertyId);
        if(!property || property.status !== "approved") return res.status(404).json({message: "Property not found"});
        if(property.seller.toString() !== sellerId.toString()) return res.status(403).json({message: "Not your property"});
        if(property.auction?.isAuction) return res.status(400).json({message: "Auction already exists"});

        property.auction = {
            isAuction: true,
            status: "pending",
            startPrice,
            currentBid: startPrice,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalBids: 0,
        };

        await property.save();

        return res.status(201).json({
            message: "Auction created successfully (Pending admin approval)",
            property
        });
    } catch (error) {
        console.error("Create Auction Error", error);
        return res.status(500).json("Internal Server Error");
    }
};