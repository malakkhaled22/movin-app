
import adminActivity from "../models/adminActivity.model";

export const logAdminActivity = async ({
    type,
    title,
    description,
    icon,
}: {
    type: string;
    title: string;
    description: string;
    icon?: string;
}) =>{
    return await adminActivity.create({
        type,
        title,
        description,
        icon
    });
};