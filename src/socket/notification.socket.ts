import { Server, Socket } from "socket.io";

export const setupNotificationSocket = (io: Server, socket: Socket) => {
    socket.on("joinUserRoom", (userId: string) => {
        socket.join(userId);
    });
};