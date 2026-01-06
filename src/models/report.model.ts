import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
    reportedBy: mongoose.Types.ObjectId;
    targetType: "user" | "property";
    targetId: mongoose.Types.ObjectId;
    subject: string;
    message: string;
    status: "pending" | "resolved";
}
const reportSchema = new Schema<IReport>(
    {
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetType: {
            type: String,
            enum: ["user", "property"],
            required: true,
        },

        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true }
);
export const Report = mongoose.model<IReport>("Report", reportSchema);
export default Report;