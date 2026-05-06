import { Request, Response } from "express";
import Property from "../models/property.model";
import { createNotificationForUser } from "../services/notifications.service";
import { logAdminActivity } from "../services/adminActivity.service";
import { notifyUsersAboutNewAuction } from "../services/auctionNotification.service";

export const getPendingAuctions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const filter = {
            status: "approved",
            "auction.isAuction": true,
            "auction.status": "pending"
        };

        const auctions = await Property.find(filter)
            .populate("seller", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments(filter);

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            auctions
        });
    } catch (error) {
        console.error("Error in Get Pending Auctions: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getApprovedAuctions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            status: "approved",
            "auction.isAuction": true,
            "auction.status": "approved"
        };

        const auctions = await Property.find(filter)
            .populate("seller", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments(filter);

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            auctions
        });
    } catch (error) {
        console.error("Error in Get Approved Auctions: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getRejectedAuctions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const filter = {
            status: "approved",
            "auction.status": "rejected"
        };

        const auctions = await Property.find(filter)
            .populate("seller", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments(filter);
        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            auctions
        });
    } catch (error) {
        console.error("Error in Get Rejected Auctions: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const approveAuction = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId).populate("seller", "username");
        if (!property) return res.status(404).json({ message: "Property not found" });

        if (!property.auction?.isAuction)
            return res.status(400).json({ message: "This property has no auction request" });

        if (property.auction?.status !== "pending")
            return res.status(400).json({ message: "Auction already reviewed" });

        if (property.auction.endTime && property.auction.endTime < new Date()) {
            property.auction.status = "expired";
            property.auction.isAuction = false;

            await property.save();

            await createNotificationForUser({
                userId: property.seller._id.toString(),
                title: "Auction Expired",
                body: "Your auction request has expired. The end time passed before admin approval.",
                type: "alert",
                action: {
                    screen: "SellerPropertyDetails",
                    entityId: propertyId.toString(),
                    extra: { openAuctionTab: true }
                }
            });

            return res.status(400).json({ message: "Auction expired before approval" });
        }
        property.auction.status = "approved";
        property.auction.currentBid = property.auction.startPrice;

        await property.save();

        await createNotificationForUser({
            userId: property.seller._id.toString(),
            title: "Auction Approved",
            body: "Your auction has been approved and now it's live.",
            type: "alert",
            action: {
                screen: "SellerPropertyDetails",
                entityId: propertyId.toString(),
                extra: { openAuctionTab: true }
            }
        });

        await notifyUsersAboutNewAuction(property);

        await logAdminActivity({
            type: "auction",
            title: "Auction approved",
            description: `${property.type} in ${property.location}`,
            icon: "auction"
        });

        return res.status(200).json({ message: "Auction approved successfully" });
    } catch (error) {
        console.error("Error in Approve Auction: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const rejectAuction = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const { reason } = req.body;

        const property = await Property.findById(propertyId).populate("seller", "username");
        if (!property) return res.status(404).json({ message: "Property not found" });

        if (!property.auction?.isAuction)
            return res.status(400).json({ message: "This property has no auction request" });

        if (property.auction?.status !== "pending")
            return res.status(400).json({ message: "Auction already reviewed" });

        property.auction.status = "rejected";
        property.auction.isAuction = false;

        await property.save();
        await createNotificationForUser({
            userId: property.seller._id.toString(),
            title: "Auction Rejected",
            body: `Your auction has been rejected. Reason: ${reason || "Not specified"}`,
            type: "alert",
            action: {
                screen: "SellerPropertyDetails",
                entityId: propertyId.toString(),
                extra: { openAuctionTab: true }
            }
        });
        await logAdminActivity({
            type: "auction",
            title: "Auction rejected",
            description: `${property.type} in ${property.location}`,
            icon: "auction"
        });

        return res.status(200).json({ message: "Auction rejected successfully" });
    } catch (error) {
        console.error("Error in Reject Auction: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};