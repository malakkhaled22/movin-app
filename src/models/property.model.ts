import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
    location: string;
    description: string;
    price: number;
    type: string;
    size: string;
    bedrooms: number;
    bathrooms: number;
    available_from: Date;
    images: string[];
    payment_method: string;
    seller: mongoose.Types.ObjectId;
    isApproved: boolean;
}

const propertySchema = new Schema<IProperty>(
    {
        location: {type: String, required: true},
        description: {type: String, required: true},
        price: {type: Number, required: true },
        type: {type: String, required: true },
        size: {type: String, required: true },
        bedrooms: {type: Number, required: true },
        bathrooms: {type: Number, required: true },
        available_from: {type: Date, required: true},
        images: { type: [String], default: [] },
        payment_method: {type: String, required: true},
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isApproved: {type: Boolean, default: false},
    },
    {timestamps: true}
);

export const Property = mongoose.model<IProperty>("Product", propertySchema);
export default Property;
