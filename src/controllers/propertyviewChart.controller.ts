import { Request, Response } from "express";
import PropertyView from "../models/propertyView.model";

export const getSellerViewsChart = async (req: Request, res: Response) => {
    try {
        const sellerId = (req.user as any)._id;
        const now = new Date();
        const startDate = new Date();
        startDate.setMonth(now.getMonth() - 5);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const viewDate = await PropertyView.aggregate([
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
            { $sort: {"_id.year": 1, "_id.month": 1 } },
        ]);

        const months: { label: string; totalViews: number }[] =[];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);

            const month = d.getMonth() + 1;
            const year = d.getFullYear();

            const found = viewDate.find(
                (x) => x._id.month === month && x._id.year === year
            );

            months.push({
                label: d.toLocaleString("en-US", { month: "short"}),
                totalViews: found ? found.totalViews : 0,
            });
        }
        return res.status(200).json({
            chart: {
                labels: months.map((m) => m.label),
                data: months.map((m) => m.totalViews)
            }
        });
    } catch (error) {
        console.error("Error in getSellerViewsChart: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};