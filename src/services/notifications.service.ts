import Notification from "../models/notifications.model";
import { io } from "../socket";

export const createNotificationForUser = async ({
    userId,
    title,
    body,
    type = "alert",
    action,
}: {
    userId: string;
    title: string;
    body: string;
    type?: string;
    action?: {
        screen: string;
        entityId?: string;
        extra?: any;
    };
}) => {
    const notification= await Notification.create({
        user: userId,
        title,
        body,
        type,
        action,
        read: false,
        createdAt: new Date(),
    });

    io.to(userId).emit("newNotification", notification);
    return Notification;
};