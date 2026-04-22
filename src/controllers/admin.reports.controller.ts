import { createNotificationForUser } from "../services/notifications.service";
import { getReportsWithPagination } from "../services/report.service";
import { Request, Response } from "express";
import Report from "../models/report.model";

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
        const  reportId  = req.params.id;
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