import mongoose from "mongoose";


export const connectDB = async (): Promise<void> => {
    try {
        const mongoURL = process.env.MONGO_URL as string;

        if (!mongoURL) {
            throw new Error("MONGO_URL is not defined in .env file");
        }
        await mongoose.connect(mongoURL);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1);
    }
}