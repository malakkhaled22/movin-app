import jwt from "jsonwebtoken";

interface Payload {
    _id: string;
    isSeller?: boolean;
    isBuyer?: boolean;
    isAdmin?: boolean;
};

export const generateToken = (payload: Payload) => {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_SECRET;
    if (!accessSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    if(!refreshSecret){
        throw new Error("REFRESH_SECRET is not defined in environment variables");
    }
    const accessToken = jwt.sign(payload, accessSecret, {
        expiresIn: "2h"
    });
    const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: "10d"
    });
    return {accessToken, refreshToken};
};