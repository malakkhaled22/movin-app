import { Request, Response } from "express";
import adminActivity from "../models/adminActivity.model";

export const getRecentActivities = async(req: Request, res:Response)=>{
    try {
        const activities =await adminActivity.find()
        .sort({createdAt: -1})
        .limit(10);

        return res.status(200).json({ count: activities.length, activities});
    } catch (error) {
        console.error("Recent Activities Error", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};