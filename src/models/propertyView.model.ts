import mongoose, { Schema } from "mongoose";
import Property from "./property.model";

export interface IPropertyView extends Document {
    property: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    viewer?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const propertyViewSchema = new Schema<IPropertyView>({
    property:{
        type: Schema.Types.ObjectId,
        ref: "Property",
        required: true,
    },
    seller:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    viewer:{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true }
);

export const PropertyView = mongoose.model<IPropertyView> ("PropertyView", propertyViewSchema);

export default PropertyView;