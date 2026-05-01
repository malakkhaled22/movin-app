import { Server, Socket } from "socket.io";
import Property from "../models/property.model";
import Bid from "../models/bid.model";
import { createNotificationForUser } from "../services/notifications.service";

type PlaceBidData = {
    propertyId: string;
    userId: string;

    amount?: number;
    increment?: number;
    percent?: number;
};
const calculateBidAmount = (
    currentBid: number,
    startPrice: number,
    data: PlaceBidData
) => {
    const base = currentBid || startPrice;

    if (data.amount !== undefined) return data.amount;
    if (data.increment !== undefined) return base + data.increment;
    if (data.percent !==undefined) return base + (base * data.percent) / 100;

    return base;
};

const lastBidTime = new Map<string, number>();
const auctionTimers = new Map<string, NodeJS.Timeout>();

const scheduleAuctionEnd = (io: Server, propertyId: string, endTime: Date) => {
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
};

const getAuctionStatus = (endTime?: Date) => {
    if (!endTime) return "ended";
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "ended";
    
    const TWO_HOUR = 120 * 60 * 1000;
    if (diff <= TWO_HOUR) return "endingSoon";

    return "live";
};

export const setupAuctionSocket = (io: Server, socket: Socket) => {

    socket.on("joinAuction", async (propertyId: string) => {
        try {
            const roomId = propertyId.toString();
            socket.join(roomId);
            console.log("JOINED ROOM: ", roomId);

            const property = await Property.findById(propertyId);

            if (!property || property.status !== "approved" || !property.auction?.isAuction || property.auction?.status !== "approved") {
                return socket.emit("auctionError", "Auction not available");
            }

            const bids = await Bid.find({ property: propertyId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("user", "username");

            if (property.auction.status === "approved" && property.auction.endTime) {
                scheduleAuctionEnd(io, propertyId, property.auction.endTime);
            }
            const status = getAuctionStatus(property.auction.endTime);
            const bidsResponse = bids.map((bid) => ({
                _id: bid._id,
                property: bid.property,
                amount: bid.amount,
                createdAt: bid.createdAt,
                user: (bid.user as any).username
            }));
            socket.emit("auctionData", {
                property,
                startPrice: property.auction.startPrice,
                currentBid: property.auction.currentBid ?? property.auction.startPrice ?? 0,
                totalBids: property.auction.totalBids || 0,
                endTime: property.auction.endTime,
                status,
                bidsResponse
            });
        } catch (error) {
            socket.emit("auctionError", "Server error");
        }
    });

    socket.on("placeBid", async ({ propertyId, amount,increment,percent, userId }: PlaceBidData) => {
        try {
            const roomId = propertyId.toString();
            console.log("ROOM:", roomId);
            const now = Date.now();
            const lastTime = lastBidTime.get(socket.id) || 0;
            if (now - lastTime < 1000) {
                return socket.emit("bidError", "Too many bids");
            }
            lastBidTime.set(socket.id, now);

            const property = await Property.findById(propertyId);
            if (!property) {
                return socket.emit("bidError", "Property not found");
            }

            if(property.status !== "approved" || property.auction?.status !== "approved"){
                return socket.emit("bidError", "Auction not available yet");
            }

            if(!property.auction?.isAuction){
                return socket.emit("bidError", "Auction not found");
            }

            const currentBid = property.auction.currentBid ?? 0;
            const startPrice = property.auction.startPrice ?? 0;
            const bidAmount = calculateBidAmount(currentBid, startPrice, {
                propertyId, userId, amount, increment, percent
            });

            const finalBidAmount = Math.round(bidAmount);
            if (!finalBidAmount || finalBidAmount <= 0) {
                return socket.emit("bidError", "Invalid bid amount");
            }
            const updatedProperty = await Property.findOneAndUpdate({
                _id: propertyId,
                status: "approved",
                "auction.status":"approved",
                "auction.isAuction": true,
                "auction.endTime": { $gt: new Date() },
                $or: [
                    { "auction.currentBid": { $lt: finalBidAmount } },
                    {
                        "auction.currentBid": { $exists: false },
                        "auction.startPrice": { $lt: finalBidAmount }
                    }
                ]
            },
                {
                    $set: { "auction.currentBid": finalBidAmount },
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
                amount: finalBidAmount
            });

            const populatedBid = await newBid.populate("user", "username");

            const bidResponse = {
                _id: populatedBid._id,
                property: populatedBid.property,
                amount: populatedBid.amount,
                createdAt: populatedBid.createdAt,
                user: (populatedBid.user as any).username,
            };
            io.to(roomId).emit("newBid", {
                bid: bidResponse,
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
        if (!property || property.status !== "approved" || !property.auction?.isAuction || property.auction?.status !== "approved") return;
        const highestBid = await Bid.findOne({ property: propertyId })
            .sort({ amount: -1 })
            .populate("user", "_id username");
        
        property.auction.isAuction = false;
        property.auction.status = "ended";
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

        const winnerId = highestBid?.user?._id?.toString();

        for (const userId of allBidders) {
            const id = userId.toString();

            if (id === winnerId) continue;

            await createNotificationForUser({
                userId: id,
                title: "Auction Ended",
                body: "Unfortunately you did not win that auction",
                type: "message"
            });
        }
        io.to(propertyId.toString()).emit("auctionEnded", {
            winnerId: winnerId,
            amount,
            status: "ended"
        });
    } catch (error) {
        console.log("End Auction Error:", error);
    }
};