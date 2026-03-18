import Notification from "../models/notifications.model";
import { io } from "../socket";

export const createNotificationForUser = async ({
    userId,
    title,
    body,
    type = "alert",
}: {
    userId: string;
    title: string;
    body: string;
    type?: string;
}) => {
    const notification= await Notification.create({
        user: userId,
        title,
        body,
        type,
        read: false,
        createdAt: new Date(),
    });

    io.to(userId).emit("newNotification", notification);
    return Notification;
};