import { Server, Socket } from "socket.io";
import Property from "../models/property.model";
import Bid from "../models/bid.model";
import { createNotificationForUser } from "../services/notifications.service";

type PlaceBidData = {
    propertyId: string;
    amount: number;
    userId: string;
};
const lastBidTime = new Map<string, number>();
const auctionTimers = new Map<string, NodeJS.Timeout>();

const scheduleAuctionEnd = (io: Server, propertyId: string, endTime: Date) => {
    const roomId = propertyId.toString();

    if (auctionTimers.has(propertyId)) {
        clearTimeout(auctionTimers.get(propertyId)!);
        auctionTimers.delete(propertyId);
    }

    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
        endAuction(io, propertyId);
        return;
    }

    const timer = setTimeout(() => {
        endAuction(io, propertyId);
        auctionTimers.delete(propertyId);
    }, timeLeft);

    auctionTimers.set(propertyId, timer);
}
const getAuctionStatus = (endTime?: Date) => {
    if (!endTime) return "ended";
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "ended";
    if (diff <= 60000) return "endingSoon";

    return "live";
};

export const setupAuctionSocket = (io: Server, socket: Socket) => {

    socket.on("joinAuction", async (propertyId: string) => {
        try {
            const roomId = propertyId.toString();
            socket.join(roomId);
            console.log("JOINED ROOM: ", roomId);
            const property = await Property.findById(propertyId);

            if (!property || !property.auction?.isAuction) {
                return socket.emit("auctionError", "Auction not found");
            }

            const bids = await Bid.find({ property: propertyId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("user", "name");

            if (property.auction.endTime) {
                scheduleAuctionEnd(io, propertyId, property.auction.endTime);
            }
            const status = getAuctionStatus(property.auction.endTime);

            socket.emit("auctionData", {
                property,
                currentBid: property.auction.currentBid ?? property.auction.startPrice ?? 0,
                totalBids: property.auction.totalBids || 0,
                endTime: property.auction.endTime,
                status,
                bids
            });
        } catch (error) {
            socket.emit("auctionError", "Server error");
        }
    });

    socket.on("placeBid", async ({ propertyId, amount, userId }: PlaceBidData) => {
        try {
            const roomId = propertyId.toString();
            console.log("ROOM:", roomId);
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
                updatedProperty.auction!.endTime = new Date(dateNow.getTime() + 30000);

                await updatedProperty.save();

                scheduleAuctionEnd(io, propertyId, updatedProperty.auction!.endTime!);

                io.to(roomId).emit("auctionExtended", {
                    endTime: updatedProperty.auction?.endTime,
                    status: getAuctionStatus(updatedProperty.auction?.endTime)
                });
            }

            const newBid = await Bid.create({
                property: propertyId,
                user: userId,
                amount
            });

            const populatedBid = await newBid.populate("user", "name");

            io.to(roomId).emit("newBid", {
                bid: populatedBid,
                currentBid: updatedProperty.auction?.currentBid,
                totalBids: updatedProperty.auction?.totalBids,
                endTime: updatedProperty.auction?.endTime,
                status: getAuctionStatus(updatedProperty.auction?.endTime)
            });
        } catch (error) {
            socket.emit("bidError", "Server error");
        }
    });
    socket.on("disconnect", () => {
        lastBidTime.delete(socket.id);
    });
};

export const endAuction = async (io: Server, propertyId: string) => {
    try {
        const property = await Property.findById(propertyId);
        if (!property || !property.auction?.isAuction) return;
        const highestBid = await Bid.findOne({ property: propertyId })
            .sort({ amount: -1 })
            .populate("user", "name");
        
        property.auction.isAuction = false;
        await property.save();

        if (auctionTimers.has(propertyId)) {
            clearTimeout(auctionTimers.get(propertyId)!);
            auctionTimers.delete(propertyId);
        }
        
        const winner = highestBid?.user;
        const amount = highestBid?.amount || property.auction.startPrice;
        
        if (winner) {
            await createNotificationForUser({
                userId: winner._id.toString(),
                title: "Congrats you won the auction!",
                body: `You've won the auction with price ${amount}`,
                type: "message"
            });
        }

        const allBidders = await Bid.find({ property: propertyId }).distinct("user");

        for (const userId of allBidders) {
            if (userId.toString() !== winner?._id.toString()) {
                await createNotificationForUser({
                    userId: userId.toString(),
                    title: "Auction Ended",
                    body: "Unfortunately you did not won that auction",
                    type: "message"
                });
            }
        }
        io.to(propertyId.toString()).emit("auctionEnded", {
            winnerId: winner?._id?.toString(),
            amount,
            status: "ended"
        });
    } catch (error) {
        console.log("End Auction Error:", error);
    }
};

