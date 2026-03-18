import { Server } from "socket.io";
import { setupAuctionSocket } from "./auction.socket";
import { setupNotificationSocket } from "./notification.socket";

let io: Server;

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:4200',
                'https://movin-app.vercel.app'
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        setupAuctionSocket(io, socket);
        setupNotificationSocket(io, socket);
    });
};

export { io };