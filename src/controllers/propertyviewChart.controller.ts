import { Request, Response } from "express";
import PropertyView from "../models/propertyView.model";
import mongoose from "mongoose";

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