import { Server } from "socket.io";
import { setupAuctionSocket } from "./auction.socket";
import { setupNotificationSocket } from "./notification.socket";
import { socketAuth } from "../middlewares/socketAuth.middleware";

let io: Server;

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        },
    });
    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        console.log("Socket User:", socket.data.user);

        setupAuctionSocket(io, socket);
        setupNotificationSocket(io, socket);
    });

    io.on("connect_error", (err) => {
        console.log("Socket Connect Error:", err.message);
    });
};

export { io };