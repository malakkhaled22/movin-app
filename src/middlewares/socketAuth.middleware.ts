import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const socketAuth = (socket: Socket, next: any) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
        return next(new Error("Unauthorized: Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        socket.data.user = decoded;
        next();
    } catch (error) {
        return next(new Error("Unauthorized: Invalid token"));
    }
};