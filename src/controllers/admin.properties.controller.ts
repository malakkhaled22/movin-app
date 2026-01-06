import { Property } from "../models/property.model";
import { Request, Response } from "express";
import Notification from "../models/notifications.model";
import { getAllPropertiesAdminService, getPendingPropertiesService, reviewProperty } from "../services/adminProps.service";


export const getPendingProperties = async (req: Request, res: Response) => {
    try {
        const properties = await getPendingPropertiesService();
    
        res.status(200).json({
            count: properties.length,
            properties,
        });
    } catch (error) {
        console.error("Get pending properties error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const approveProperty = async (req: Request, res: Response) => {
    try {
        const result = await reviewProperty(
            req.params.id,
            (req.user as any)._id,
            "approved"
        );

        if (!result) return res.status(404).json({ message: "Property not found" });
        if (result === "reviewed")
            return res.status(400).json({ message: "Property already reviewed" });

        res.status(200).json({ message: "Property approved successfully" });
    } catch (error) {
        console.error("Error in approving property ", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const rejectProperty = async (req: Request, res: Response) => {
    try {
        const result = await reviewProperty(
            req.params.id,
            (req.user as any)._id,
            "rejected",
            req.body.reason
        );

        if (!result) return res.status(404).json({ message: "Property not found" });
        if (result === "reviewed")
            return res.status(400).json({ message: "Property already reviewed" });

        res.status(200).json({ message: "Property rejected" });
    } catch (error) {
        console.error("Error in reject property", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllPropertiesAdmin = async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await getAllPropertiesAdminService(page, limit, status);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching admin properties", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};