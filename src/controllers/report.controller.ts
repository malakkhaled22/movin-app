import { Request, Response } from "express";
import Report from "../models/report.model";

export const createReport = async (req: Request, res: Response) => {
    try {
        const reportedBy = (req as any).user._id;
        const { subject, message, targetType, targetId } = req.body;

        if (!subject || !message ||!targetType ||!targetId) {
            return res.status(400).json({ message: "subject, message, targetType and targetId are required" });
        }

        if (!["User", "Property"].includes(targetType)) {
            return res.status(400).json({ message: "Invalid targetType" });
        }
        const report = await Report.create({
            reportedBy,
            targetType,
            targetId,
            subject,
            message,
        });

        return res.status(201).json({
            message: "Report created successfully",
            report,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMyReports = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const reports = await Report.find({ reportedBy: userId })
            .populate({
                path: "targetId",
                select: "username email type location",
            })
            .sort({ createdAt: -1 });
        
        return res.status(200).json({ reports });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};