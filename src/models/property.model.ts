import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
    location: string;
    description: string;
    price: number;
    type: "apartment" | "villa" | "office" | "penthouse" | "townhouse";
    listingType: "rent" | "sale";
    size: string;
    //bedrooms: number;
    //bathrooms: number;
    //available_from: Date;
    images: {
        url: string;
        public_id: string;
    }[];
    details: any;
    //payment_method: string;
    seller: mongoose.Types.ObjectId;
    status: string;
    approvedBy: mongoose.Types.ObjectId;
    rejectedReason?: string | null;
}

const propertySchema = new Schema<IProperty>(
    {
        location: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        listingType: {
            type: String,
            enum: ["sale", "rent"],
            required: true
        },
        type: {
            type: String,
            enum: ["apartment", "villa", "office", "townhouse", "penthouse"],
            required: true
        },
        size: { type: String, required: true },
        //bedrooms: {type: Number, required: true },
        //bathrooms: {type: Number, required: true },
        //available_from: {type: Date, required: true},
        images: [
            {
                url: String,
                public_id: String,
            }
        ],
        //payment_method: {type: String, required: true},
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        details: {
            type: Schema.Types.Mixed,
            required: true,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        rejectedReason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

export const Property = mongoose.model<IProperty>("Property", propertySchema);
export default Property;
