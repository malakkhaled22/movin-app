import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document{
    reportedBy: mongoose.Types.ObjectId,
    reportedUser: mongoose.Types.ObjectId,
    reportedProperty:mongoose.Types.ObjectId,
    subject: string,
    status: string,
    message:string,
};

const reportSchema = new Schema<IReport>(
    {
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reportedUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reportedProperty: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true
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