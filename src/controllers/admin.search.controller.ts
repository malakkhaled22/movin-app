import { Request, Response } from "express";
import User from "../models/user.model";
import Property from "../models/property.model";

export const adminSearch = async (req: Request, res: Response) => {
    try {
        const q = (req.query.q as string)?.trim();
        const type = (req.query.type as string) || "all";

        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const regex = new RegExp(q, "i");
        let users: any[] = [];
        let properties: any[] = [];

        if (type === "users" || type === "all") {
            users = await User.find({
                $or: [
                    { username: regex },
                    { email: regex },
                ],
            })
                .select("username email isBlocked isSeller isBuyer createdAt")
                .skip(skip)
                .limit(limit);
        }

        if (type === "properties" || type === "all") {
            properties = await Property.find({
                $or: [
                    { location: regex },
                    { type: regex },
                    { description: regex },
                ],
            })
                .populate("seller", "username email")
                .skip(skip)
                .limit(limit);
        }

        return res.status(200).json({
            page,
            limit,
            userCount: users.length,
            propertiesCount: properties.length,
            users,
            properties,
        });
    } catch (error) {
        console.error("Admin search error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}