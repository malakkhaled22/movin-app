import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const socketAuth = (socket: Socket, next: any) => {
    try {

        const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

    console.log("SOCKET TOKEN:", token);

    if (!token) return next(new Error("Unauthorized"));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!token) {
        return next(new Error("Unauthorized: Token missing"));
        }
        socket.data.user = decoded;
        next();
    } catch (error) {
        console.log("SOCKET AUTH ERROR:", error);
        return next(new Error("Unauthorized: Invalid token"));
    }
};