import { Request, Response } from "express";
import Notification from "../models/notifications.model";

//user-triggered
export const addNotification = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { title, body, type } = req.body;
        const notif = await Notification.create({
            user: userId,
            title,
            body,
            type: type || "alert",
            read: false,
            createdAt: new Date()
        });

        return res.status(201).json({
            message: "Notification created successfully",
            notification: notif
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const items = await Notification.find({ user: userId })
            .sort({ createdAt: -1 });
        
        return res.status(200).json(items);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await Notification.findByIdAndUpdate(
            { _id: id, user: (req.user as any)._id },
            { read: true }
        );

        return res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        await Notification.updateMany(
            { user: userId, read: false },
            { $set: { read: true } }
        );

        return res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getMessageNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const notifications = await Notification.find({
            user: userId,
            type: "message",
        }).sort({ createdAt: -1 });

        return res.json(notifications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAlertNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const notifications = await Notification.find({
            user: userId,
            type: "alert",
        }).sort({ createdAt: -1 });

        return res.json(notifications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const clearNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        await Notification.deleteMany({ user: userId });

        return res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};