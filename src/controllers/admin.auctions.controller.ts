import {Request, Response} from "express";
import Property from "../models/property.model";
import { createNotificationForUser } from "../services/notifications.service";


export const getPendingAuctions = async (req:Request, res:Response)=>{
    try {
        const auctions = await Property.find({
            status: "approved",
            "auction.isAuction":true,
            "auction.status": "pending",
        }).populate("seller", "username email");

        return res.status(200).json({
            count: auctions.length,
            auctions,
        });
    } catch (error) {
        console.error("Error in Get Pending Auctions: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

export const getApprovedAuctions = async (req:Request, res:Response)=>{
    try {
        const auctions = await Property.find({
            status: "approved",
            "auction.isAuction":true,
            "auction.status": "approved",
        }).populate("seller", "username email");

        return res.status(200).json({
            count: auctions.length,
            auctions,
        });
    } catch (error) {
        console.error("Error in Get Approved Auctions: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

export const getRejectedAuctions = async (req:Request, res:Response)=>{
    try {
        const auctions = await Property.find({
            status: "approved",
            "auction.isAuction":true,
            "auction.status": "rejected",
        }).populate("seller", "username email");

        return res.status(200).json({
            count: auctions.length,
            auctions,
        });
    } catch (error) {
        console.error("Error in Get Rejected Auctions: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

export const approveAuction = async (req: Request, res: Response)=>{
    try {
        const {propertyId} = req.params;

        const property = await Property.findById(propertyId).populate("seller", "username");
        if(!property) return res.status(404).json({message: "Property not found"});
        if(!property.auction?.isAuction) return res.status(400).json({message: "This property has no auction request"});
        if(property.auction?.status !== "pending") return res.status(400).json({message: "Auction already reviewed"});

        if(property.auction.endTime && property.auction.endTime < new Date()){
            property.auction.status = "expired";
            property.auction.isAuction = false;

            await property.save();

            await createNotificationForUser({
                userId: property.seller._id.toString(),
                title: "Auction Expired",
                body: "Your auction request has expired the end time passed before admin approval.",
                type: "alert"
            });
            return res.status(400).json({message: "Auction expired before approval"});
        }
        property.auction.status = "approved";
        property.auction.currentBid = property.auction.startPrice;

        await property.save();

        await createNotificationForUser({
            userId: property.seller._id.toString(),
            title: "Auction Approved",
            body: "Your auction has been approved and now its live",
            type: "alert",
        });

        return res.status(200).json({message: "Auction approved successfully"});
    } catch (error) {
        console.error("Error in Approve Auction: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

export const rejectAuction = async (req:Request, res:Response)=>{
    try {
        const {propertyId} = req.params;
        const {reason} = req.body;
        const property = await Property.findById(propertyId).populate("seller", "username");
        if(!property) return res.status(404).json({message: "Property not found"});
        if(!property.auction?.isAuction) return res.status(400).json({message: "This property has no auction request"});
        if(property.auction?.status !== "pending") return res.status(400).json({message: "Auction already reviewed"});

        property.auction.status = "rejected";
        property.auction.isAuction = false;

        await property.save();

        if (property.seller && property.seller._id) {
        await createNotificationForUser({
            userId: property.seller._id.toString(),
            title: "Auction Rejected",
            body: `Your auction has been rejected. Reason: ${reason || null}`,
            type: "alert",
        });
    }
        return res.status(200).json({message: "Auction rejected successfully"});
    } catch (error) {
        console.error("Error in Reject Auction: ", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};