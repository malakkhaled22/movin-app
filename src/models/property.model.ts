import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
    location: string;
    description: string;
    title: string;
    price: number;
    type: "apartment" | "villa" | "office" | "penthouse" | "townhouse";
    listingType: "rent" | "sale";
    size: number;
    images: {
        url: string;
        public_id: string;
    }[];
    coordinates: {
        latitude: number;
        longitude: number;
    };
    details: any;
    seller: mongoose.Types.ObjectId;
    status: string;
    approvedBy: mongoose.Types.ObjectId;
    rejectedReason?: string | null;
    views: number;
    auction?: {
        isAuction: boolean;
        status: "pending" | "approved" | "rejected" | "expired" | "ended";
        startPrice: number;
        currentBid?: number;
        startTime: Date;
        endTime: Date;
        totalBids: number;
    };
}

const propertySchema = new Schema<IProperty>(
    {
        location: { type: String, required: true },
        description: { type: String, required: true },
        title: {
        type: String,
        required: true,
        trim: true,
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },
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
        size: { type: Number, required: true },
        images: {
            type: [
                {
                    url: String,
                    public_id: String,
                }
            ],
            validate: [
                {
                    validator: function(images: any[]) {
                        return images.length >= 3;
                    },
                    message: "Minimum 3 images are required"
                },
                {
                    validator: function(images: any[]) {
                        return images.length <= 12;
                    },
                    message: "Maximum 12 images are allowed"
                }
            ]
        },
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
        views: {
            type: Number,
            default: 0,
        },
        auction: {
            isAuction: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ["pending", "approved", "rejected", "expired", "ended"],
                default: "pending"
            },
            startPrice: { type: Number },
            currentBid: { type: Number },
            startTime: { type: Date },
            endTime: { type: Date },
            totalBids: { type: Number, default: 0 }
        },
    },
    { timestamps: true }
);

export const Property = mongoose.model<IProperty>("Property", propertySchema);
export default Property;
