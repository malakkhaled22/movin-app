import mongoose, { Schema, Document } from "mongoose";

export interface IBlacklistedToken extends Document {
    token: string;
    expiredAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>({
    token: { type: String, required: true },
    expiredAt: { type: Date, required: true }
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const blacklistedToken = mongoose.model<IBlacklistedToken>(
    "BlacklistedToken",
    blacklistedTokenSchema
);