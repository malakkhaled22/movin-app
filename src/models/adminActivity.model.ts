import mongoose, {Schema, Document} from "mongoose";

export interface IAdminActivity extends Document {
    type: string;
    title: string;
    description: string;
    icon?: string;
    createdAt: Date;
}

const adminActivitySchema = new Schema<IAdminActivity> ({
    type: {type: String, required: true},
    title: {type: String, required: true},
    description: { type: String, required: true},
    icon: {type: String, default: ""},
}, {timestamps: true});

const adminActivity =mongoose.model<IAdminActivity>("adminActivity", adminActivitySchema);

export default adminActivity;