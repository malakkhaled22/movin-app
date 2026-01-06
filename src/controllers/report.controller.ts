import { Request, Response } from "express";
import Report from "../models/report.model";
import User from "../models/user.model";
import { createNotificationForUser } from "../services/notifications.service";
import { getReportsWithPagination } from "../services/report.service";

export const createReport = async (req: Request, res: Response) => {
    try {
        const reportedBy = (req as any).user._id;
        const { subject, message, targetType, targetId } = req.body;

        if (!subject || !message ||!targetType ||!targetId) {
            return res.status(400).json({ message: "subject, message, targetType and targetId are required" });
        }

        if (!["user", "property"].includes(targetType)) {
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

export const getAllReports = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string | undefined;

        const result = await getReportsWithPagination({
            page,
            limit,
            status,
        });
        
        return res.status(200).json({
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            count: result.reports.length,
            reports: result.reports,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        const allowedStatus = ["pending", "resolved"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const report = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (status === "resolved") {
            await createNotificationForUser({
                userId: report.reportedBy.toString(),
                title: "Report Resolved",
                body: "Your report has been reviewed and resolved by the admin.",
                type: "alert",
            });
        }

        return res.status(200).json({
            message: "Report status updated",
            report,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};