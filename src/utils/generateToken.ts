import jwt from "jsonwebtoken";

interface Payload {
    _id: string;
    isSeller?: boolean;
    isBuyer?: boolean;
    isAdmin?: boolean;
}

export const generateToken = (payload: Payload): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(payload, secret, {
        expiresIn: "1h"
    });
};