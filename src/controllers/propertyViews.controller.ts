import { Request, Response } from "express";
import PropertyView from "../models/propertyView.model";
import mongoose from "mongoose";
import Property from "../models/property.model";
import User from "../models/user.model";

export const getSellerViewsChart = async (req: Request, res: Response) => {
    try {
        const sellerId = new mongoose.Types.ObjectId((req.user as any)._id);
        
        const now = new Date();
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(1); 
        startDate.setMonth(now.getMonth() - 5);

        const viewData = await PropertyView.aggregate([
            {
                $match: {
                    seller: sellerId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalViews: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const labels: string[] = [];
        const data: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(now.getMonth() - i);

            const month = d.getMonth() + 1;
            const year = d.getFullYear();

            const found = viewData.find(
                (x) => x._id.month === month && x._id.year === year
            );

            labels.push(d.toLocaleString("en-US", { month: "short" }));
            data.push(found ? found.totalViews : 0);
        }

        return res.status(200).json({
            chart: {
                labels,
                data
            }
        });
    } catch (error) {
        console.error("Error in getSellerViewsChart: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBuyerViewHistory = async (req: Request, res: Response) => {
    try {
    const buyerId = new mongoose.Types.ObjectId((req.user as any)._id);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const history = await PropertyView.aggregate([
    { $match: { viewer: buyerId } },
    {
        $group: {
            _id: "$property",
            lastViewedAt: { $max: "$createdAt" },
        },
    },
    { $sort: { lastViewedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
        $lookup: {
        from: "properties",
        localField: "_id",
        foreignField: "_id",
        as: "property",
        },
    },
    { $unwind: "$property" },
    {
        $lookup: {
        from: "users",
        localField: "property.seller",
        foreignField: "_id",
        as: "seller",
        },
    },
    { $unwind: "$seller" },
    {
        $project: {
        _id: 0,
        lastViewedAt: 1,
        property: {
            _id: "$property._id",
            location: "$property.location",
            price: "$property.price",
            listingType: "$property.listingType",
            type: "$property.type",
            images: "$property.images",
            views: "$property.views",
            auction: "$property.auction",
            status: "$property.status",
            title: "$property.title",
            coordinates: "$property.coordinates",
            bathrooms: "$property.details.bathrooms",
            bedrooms: "$property.details.bedrooms",
            size: "$property.size",
            description: "$property.description",
            },
            seller: {
            _id: "$seller._id",
            username: "$seller.username",
            email: "$seller.email",
            phone: "$seller.phone",
            location: "$seller.location",
            },
        },
    },
]);
    const totalDistinct = await PropertyView.aggregate([
        { $match: { viewer: buyerId } },
        { $group: { _id: "$property" } },
        { $count: "count" },
    ]);
    const total = totalDistinct[0]?.count || 0;

    return res.status(200).json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        history,
    });
    } catch (error) {
    console.error("Error in getBuyerViewHistory:", error);
    return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const clearBuyerViewHistory = async (req: Request, res: Response) => {
    try {
        const buyerId = new mongoose.Types.ObjectId((req.user as any)._id);
        const result = await PropertyView.deleteMany({
            viewer: buyerId
        });

        return res.status(200).json({
            message: "View history cleared successfully",
            deletedCount: result.deletedCount,
        });

    } catch (error) {
        console.error("Error in clearBuyerViewHistory:", error);
        return res.status(500).json({ message: "Internal Server Error"});
    }
};

export const getSellerDashboardStats = async (req: Request, res: Response) => {
    try {
        const sellerId = new mongoose.Types.ObjectId((req.user as any)._id);

        const activeListings = await Property.countDocuments({
            seller: sellerId,
            status: "approved",
        });

        const viewsResult = await Property.aggregate([
            {
                $match: {
                seller: sellerId,
                status: "approved",
                },
            },
            {
                $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                },
            },
        ]);

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

        const sellerPropertiesIds = await Property.find({ seller: sellerId }).distinct("_id");
        const favoritesCount = await User.countDocuments({
            favorites: { $in: sellerPropertiesIds },
        });

        const auctionListings = await Property.countDocuments({
            seller: sellerId,
            status: "approved",
            "auction.isAuction": true,
            "auction.status": "approved",
        });

        return res.status(200).json({
            activeListings,
            totalViews,
            totalFavorites: favoritesCount,
            auctionListings,
        });
    } catch (error) {
        console.error("Error in Get Seller Dashboard Stats: ", error);
        return res.status(500).json("Internal Server Error");
    }
};