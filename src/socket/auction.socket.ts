import { Server, Socket } from "socket.io";
import Property from "../models/property.model";
import Bid from "../models/bid.model";

type PlaceBidData = {
    propertyId: string;
    amount: number;
    userId: string;
};
const lastBidTime = new Map<string, number>();

export const setupAuctionSocket = (io: Server, socket: Socket) => {

    socket.on("joinAuction", async (propertyId: string) => {
        try {
            socket.join(propertyId);

            const property = await Property.findById(propertyId);

            if (!property || !property.auction?.isAuction) {
                return socket.emit("auctionError", "Auction not found");
            }

            const bids = await Bid.find({ property: propertyId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("user", "name");
            const now = new Date();
            const endTime = property.auction.endTime;

            const timeRemaining = endTime ? Math.max(0, endTime.getTime() - now.getTime()) : 0;

            socket.emit("auctionData", {
                property,
                currentBid: property.auction.currentBid ?? property.auction.startPrice ?? 0,
                totalBids: property.auction.totalBids || 0,
                endTime: property.auction.endTime,
                bids
            });
        } catch (error) {
            socket.emit("auctionError", "Server error");
        }
    });

    socket.on("placeBid", async ({ propertyId, amount, userId }: PlaceBidData) => {
        try {

            const now = Date.now();
            const lastTime = lastBidTime.get(socket.id) || 0;
            if (now - lastTime < 1000) {
                return socket.emit("bidError", "Too many bids");
            }
            lastBidTime.set(socket.id, now);

            const updatedProperty = await Property.findOneAndUpdate({
                _id: propertyId,
                "auction.isAuction": true,
                "auction.endTime": { $gt: new Date() },
                $or: [
                    { "auction.currentBid": { $lt: amount } },
                    {
                        "auction.currentBid": { $exists: false },
                        "auction.startPrice": { $lt: amount }
                    }
                ]
            },
                {
                    $set: { "auction.currentBid": amount },
                    $inc: { "auction.totalBids": 1 }
                },
                { new: true }
            );

            if (!updatedProperty) {
                return socket.emit("bidError", "Bid too low or invalid auction");
            }
            const dateNow = new Date();
            let endTime = updatedProperty.auction?.endTime;

            if (endTime && endTime.getTime() - dateNow.getTime() < 30000) {
                endTime = new Date(dateNow.getTime() + 30000);
                await updatedProperty.save();

                io.to(propertyId).emit("auctionExtended", {
                    endTime: updatedProperty.auction?.endTime
                });
            }
            await Bid.create({
                property: propertyId,
                user: userId,
                amount
            });

            io.to(propertyId).emit("newBid", {
                amount,
                userId,
                endTime: updatedProperty.auction?.endTime
            });

            socket.on("disconnect", () => {
                lastBidTime.delete(socket.id);
            });

        } catch (error) {
            socket.emit("bidError", "Server error");
        }
    });
};