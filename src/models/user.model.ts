import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: String;
    email: string;
    isGoogleAuth: boolean;
    phone: string;
    password: string;
    isAdmin?: boolean;
    isBuyer?: boolean;
    isSeller?: boolean;
    profilePic: string;
    canSwitchRole?: boolean;

    otpCode?: string | null;
    otpExpire?: Date | null;
    isVerified?: boolean;

    comparePassword(candidatePassword: string): Promise<boolean>;
    createPasswordResetToken(): string; 
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: {
            type: String,
            required: function (): boolean { return !this.isGoogleAuth; }
        },

        password: {
            type: String,
            required: function (): boolean { return !this.isGoogleAuth; }
        },
        isSeller: { type: Boolean, default:false },
        isAdmin: { type: Boolean, default: false },
        isBuyer: { type: Boolean, default:false },
        canSwitchRole: { type: Boolean, default: true }, 
        otpCode: { type: String, default: null },
        otpExpire: { type: Date, default: null },
        isVerified: { type: Boolean, default: null },
        isGoogleAuth: { type: Boolean, default: false },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//compare passwords
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model<IUser>("User", userSchema);
export default User;