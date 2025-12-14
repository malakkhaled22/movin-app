import { Request, Response } from "express";
import User from "../models/user.model";
import Property from "../models/property.model";

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalBuyers,
            totalSellers,
            totalProperties,
            pendingProperties,
            approvedProperties,
            rejectedProperties,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isBuyer: true }),
            User.countDocuments({ isSeller: true }),
            Property.countDocuments(),
            Property.countDocuments({ status: "pending" }),
            Property.countDocuments({ status: "approved" }),
            Property.countDocuments({ status: "rejected" }),
        ]);

        return res.status(200).json({
            users: {
                total: totalUsers,
                buyers: totalBuyers,
                sellers: totalSellers
            },
            properties: {
                total: totalProperties,
                pending: pendingProperties,
                approved: approvedProperties,
                rejected: rejectedProperties,
            },
        });
    } catch (error) {
        console.error("Error in getting admin stats", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};