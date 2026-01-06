import Notification from "../models/notifications.model";


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
    return await Notification.create({
        user: userId,
        title,
        body,
        type,
        read: false,
        createdAt: new Date(),
    });
};