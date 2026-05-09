import mongoose, { Schema, Document } from "mongoose";

export interface IBid extends Document{
    property: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
};

const bidSchema = new Schema<IBid>({
    property: {
        type: Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
}, { timestamps: true });

export const Bid = mongoose.model<IBid>("Bid", bidSchema);
export default Bid;