import mongoose from "mongoose";
import { User } from "../models/user.model";
import { createNotificationForUser } from "./notifications.service";

export const notifyUsersAboutNewAuction = async (property: any) => {
    try {
        if (!property || !property.auction?.isAuction) return;

        const now = new Date();

        if (property.auction.startTime && property.auction.startTime > now) {
            return;
        }

        const sellerId = property.seller?._id?.toString();

        const usersAgg = await User.aggregate([
            {
                $lookup: {
                    from: "properties",
                    localField: "favorites",
                    foreignField: "_id",
                    as: "favProperties"
                }
            },
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(sellerId) },
                    $or: [
                        { favorites: property._id },
                        { "searchHistory.location": property.location },
                        { "favProperties.type": property.type },
                        { "favProperties.listingType": property.listingType }
                    ]
                }
            },
            {
                $project: { _id: 1 }
            }
        ]);

        const userIds = usersAgg.map(u => u._id.toString());

        if (userIds.length === 0) return;

        await Promise.all(
            userIds.map(userId =>
                createNotificationForUser({
                    userId,
                    title: "New Auction Available!",
                    body: `New auction has started on a property in ${property.location}`,
                    type: "alert",
                    action: {
                        screen: "PropertyDetails",
                        entityId: property._id.toString(),
                        extra: { 
                            openAuctionTab: true,
                            property: property,
                        }
                    }
                })
            )
        );
    } catch (error) {
        console.error("Error in notifyUsersAboutNewAuction:", error);
    }
};