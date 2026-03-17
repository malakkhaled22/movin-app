import { Server } from "socket.io";
import { setupAuctionSocket } from "./auction.socket";

let io: Server;

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        setupAuctionSocket(io, socket);
    });
};

export const getIO = () => io;