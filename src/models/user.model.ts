import bcrypt from "bcrypt";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    username: String;
    email: string;
    isGoogleAuth: boolean;
    phone: number;
    password: string;

    isAdmin?: boolean;
    isBuyer?: boolean;
    isSeller?: boolean;
     isBlocked?: boolean;

    profilePic: string;
    canSwitchRole?: boolean;

    otpCode?: string | null;
    otpExpire?: Date | null;
    isVerified?: boolean;
    favorites?: mongoose.Types.ObjectId[];

    comparePassword(candidatePassword: string): Promise<boolean>;
    createPasswordResetToken(): string; 
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ],
        },
        phone: {
            type: Number,
            required: function (): boolean { return !this.isGoogleAuth; },
            validate: {
                validator: function (value: number) {
                    return /^[0-9]{10,15}$/.test(value.toString());
                },
                message: "Phone number must be between 10-15 digits"
            }
        },
        password: {
            type: String,
            required: function (): boolean { return !this.isGoogleAuth; },
            validate: {
                validator: function (value: string) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
                },
                message:
                    "Password must be at least 8 characters, include uppercase, lowercase letters and numbers"
            }
        },
        isSeller: { type: Boolean, default:false },
        isAdmin: { type: Boolean, default: false },
        isBuyer: { type: Boolean, default:false },
        isBlocked: { type: Boolean, default: false },   
        canSwitchRole: { type: Boolean, default: true }, 
        otpCode: { type: String, default: null },
        otpExpire: { type: Date, default: null },
        isVerified: { type: Boolean, default: null },
        isGoogleAuth: { type: Boolean, default: false },
        favorites: [{
            type: mongoose.Types.ObjectId,
            ref: "Property",
            default: []
        }],
        
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