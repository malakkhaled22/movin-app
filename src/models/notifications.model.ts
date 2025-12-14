import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    body: string;
    type: string;
    read: boolean;
};

const notificationSchema = new Schema<INotification>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "alert" },
    read: { type: Boolean, default: false },
},
    { timestamps: true },
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;