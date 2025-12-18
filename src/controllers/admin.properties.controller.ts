import { Property } from "../models/property.model";
import { Request, Response } from "express";
import Notification from "../models/notifications.model";


export const getPendingProperties = async (req: Request, res: Response) => {
    try {
        const properties = await Property.find({ status: "pending" })
            .populate("seller", "username email");
    
        res.status(200).json({
            count: properties.length,
            properties,
        });
    } catch (error) {
        console.error("Get pending properties error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const approveProperty = async (req: Request, res: Response) => {
    try {
        const propertyId = req.params.id;
        const adminId = (req.user as any)._id;
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.status !== "pending") {
            return res.status(400).json({
                message: "Property already reviewed"
            });
        };

        property.status = "approved";
        property.approvedBy = adminId;
        property.rejectedReason = null;

        await property.save();

        await Notification.create({
            user: property.seller,
            title: "Property Approved",
            body: `Your property "${property.type}" has been approved.`,
            type: "alert",
            read: false,
        })

        res.status(200).json({
            message: "Property approaved successfully",
        });
    } catch (error) {
        console.error("Error in approving property ", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const rejectProperty = async (req: Request, res: Response) => {
    try {
        const { reason } = req.body;
        const propertyId = req.params.id;
        const adminId = (req.user as any)._id;
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.status !== "pending") {
            return res.status(400).json({
                message: "Property already reviewed"
            });
        };

        property.status = "rejected";
        property.rejectedReason = reason || "Not specified";
        property.approvedBy = adminId;

        await property.save();

        await Notification.create({
            user: property.seller,
            title: "Property Rejected",
            body: `Your property "${property.type}" was rejected. Reason: ${property.rejectedReason}`,
            type: "alert",
            read: false,
        });

        res.status(200).json({
            message: "Property rejected",
        });
    } catch (error) {
        console.error("Error in reject property", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllPropertiesAdmin = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        //pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const allowedStatus = ["pending", "approved", "rejected"];
        if (status && !allowedStatus.includes(status as string)) {
            return res.status(400).json({ message: "Invalid status filter" });
        }
        
        const filter: any = {};
        if (status) {
            filter.status = (status as string).trim().toLowerCase();
        }
        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate("seller", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Property.countDocuments(filter),
        ]);

        return res.status(200).json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            count: properties.length,
            properties,
        });
    } catch (error) {
        console.error("Error fetching admin properties", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

