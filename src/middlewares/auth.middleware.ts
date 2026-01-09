import jwt from "jsonwebtoken"; 
import { Request, Response, NextFunction } from "express";
import { blacklistedToken } from "../models/blacklistToken.model";

export interface JwtPayload{
    _id: string;
    isAdmin: boolean;
    isSeller: boolean;
    isBuyer: boolean;
}
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Token received in Header:", req.headers.authorization);
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const JWT_SECRET = process.env.JWT_SECRET;
        
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in .env file");
        }
        const blacklisted = await blacklistedToken.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ message: "Token expired 'Logout' "});
        }
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = decoded;
        
        next();
    } catch (error) {
        console.error("❌ Token verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};