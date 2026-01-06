import { Property } from "../models/property.model";
import Notification from "../models/notifications.model";
import mongoose from "mongoose";

export const getPendingPropertiesService = async () => {
    return Property.find({ status: "pending" })
        .populate("seller", "username email");
};

export const reviewProperty = async (
    propertyId: string,
    adminId: string,
    status: "approved" | "rejected",
    reason?: string
) => {
    const property = await Property.findById(propertyId);
    if (!property) return null;
    if (property.status !== "pending") return "reviewed";

    property.status = status;
    property.approvedBy = new mongoose.Types.ObjectId(adminId);
    property.rejectedReason = status === "rejected" ? reason || "Not specified" : null;

    await property.save();

    await Notification.create({
        user: property.seller,
        title: status === "approved" ? "Property Approved" : "Property Rejected",
        body:
            status === "approved"
                ? `Your property "${property.type}" has been approved.`
                : `Your property "${property.type}" was rejected. Reason: ${property.rejectedReason}`,
        type: "alert",
        read: false,
    });

    return property;
};

export const getAllPropertiesAdminService = async (
    page: number,
    limit: number,
    status?: string
) => {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (status) filter.status = status;

    const [properties, total] = await Promise.all([
        Property.find(filter)
            .populate("seller", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Property.countDocuments(filter),
    ]);

    return {
        properties,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};