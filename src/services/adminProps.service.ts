import { Property } from "../models/property.model";
import Notification from "../models/notifications.model";
import mongoose from "mongoose";
import User from "../models/user.model";
import { createNotificationForUser } from "./notifications.service";
import { logAdminActivity } from "./adminActivity.service";
import { notifyUsersAboutNewAuction } from "./auctionNotification.service";

export const getPendingPropertiesService = async () => {
    return Property.find({ status: "pending" })
        .populate("seller", "username email")
        .sort({createdAt: -1});
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

    if(status === "approved"){
        await logAdminActivity({
            type: "property",
            title: "Property approved",
            description: `${property.type} in ${property.location}`,
            icon: "home"
        });
    };

    if(status === "rejected"){
        await logAdminActivity({
            type: "property",
            title: "Property rejected",
            description: `${property.type} in ${property.location}`,
            icon: "home"
        });
    };

    await createNotificationForUser({
    userId: property.seller.toString(),
    title: status === "approved"
        ? "Property Approved"
        : "Property Rejected",
    body:
        status === "approved"
            ? `Your property "${property.type}" has been approved.`
            : `Your property "${property.type}" was rejected. Reason: ${property.rejectedReason}`,
    type: "alert",
    action: {
        screen: "SellerPropertyDetails",
        entityId: propertyId.toString(),
        extra: {
                property: property,
            }
    }
});

    if (status === "approved" && property.auction?.isAuction) {
        await notifyUsersAboutNewAuction(property);
    }
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

    const properties = await Property.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: "users",
                localField: "seller",
                foreignField: "_id",
                as: "sellerDetails"
            }
        },
        { $unwind: "$sellerDetails" },
        {
            $lookup: {
                from: "reports",
                let: { propertyId: "$_id", sellerId: "$sellerDetails._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $and: [
                                        { $eq: ["$targetType", "Property"] },
                                        { $eq: ["$targetId", "$$propertyId"] }
                                    ]},
                                    { $and: [
                                        { $eq: ["$targetType", "User"] },
                                        { $eq: ["$targetId", "$$sellerId"] }
                                    ]}
                                ]
                            }
                        }
                    }
                ],
                as: "propertyAndSellerReports"
            }
        },
        {
            $addFields: {
                seller: {
                    _id: "$sellerDetails._id",
                    username: "$sellerDetails.username",
                    email: "$sellerDetails.email",
                    isBlocked: "$sellerDetails.isBlocked",
                    reportsCount: { $size: "$propertyAndSellerReports" }
                }
            }
        },

        { $project: { sellerDetails: 0, propertyAndSellerReports: 0 } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]);

    const total = await Property.countDocuments(filter);

    return {
        properties,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};