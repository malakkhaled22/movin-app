import { Server, Socket } from "socket.io";
import Property from "../models/property.model";
import Bid from "../models/bid.model";
import { createNotificationForUser } from "../services/notifications.service";

type PlaceBidData = {
    propertyId: string;
    amount?: number;
    increment?: number;
    percent?: number;
};

type BidInput = {
    amount?: number;
    increment?: number;
    percent?: number;
};

const BID_RATE_LIMIT = 1000;
const AUCTION_EXTENDED = 60_000;
const ENDING_SOON_TWO_HOURS = 120 * 60 * 1000;

const lastBidTime = new Map<string, number>();
const auctionTimers = new Map<string, NodeJS.Timeout>();

const calculateBidAmount = (
    currentBid: number,
    startPrice: number,
    data: BidInput
    ) => {
    const base = currentBid || startPrice;

    if (data.amount !== undefined) return data.amount;
    if (data.increment !== undefined) return base + data.increment;
    if (data.percent !== undefined) return base + (base * data.percent) / 100;

    return base;
};

const getAuctionStatus = (endTime?: Date) => {
    if (!endTime) return "ended";

    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "ended";
    if (diff <= ENDING_SOON_TWO_HOURS) return "endingSoon";

    return "live";
};

const mapBidHistory = (bid: any) => ({
    _id: bid._id,
    property: bid.property,
    amount: bid.amount,
    createdAt: bid.createdAt,
    user: (bid.user as any).username,
});

const clearAuctionTimer = (propertyId: string) => {
    if (auctionTimers.has(propertyId)) {
        clearTimeout(auctionTimers.get(propertyId)!);
        auctionTimers.delete(propertyId);
    }
};

const scheduleAuctionEnd = (io: Server, propertyId: string, endTime: Date) => {
    
    clearAuctionTimer(propertyId);

    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
        endAuction(io, propertyId);
        return;
    }
    const timer = setTimeout(() => {
        endAuction(io, propertyId);
        clearAuctionTimer(propertyId);
    }, timeLeft);
    auctionTimers.set(propertyId, timer);
};

const emitAuctionError = (socket: Socket, message: string) => {
    return socket.emit("auctionError", message);
};

const emitBidError = (socket: Socket, message: string) => {
    return socket.emit("bidError", message);
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

            const bidsHistory = bids.map(mapBidHistory);

            socket.emit("auctionData", {
                property,
                startPrice: property.auction.startPrice,
                currentBid: property.auction.currentBid ?? property.auction.startPrice ?? 0,
                totalBids: property.auction.totalBids || 0,
                endTime: property.auction.endTime,
                status,
                bidsHistory
            });
        } catch (error) {
            emitAuctionError(socket, "Server error");
        }
    });

    socket.on(
        "placeBid",
        async ({ propertyId, amount,increment,percent}: PlaceBidData) => {
        try {
            const userId = socket.data.user?._id;
            if (!userId) {
                return emitBidError(socket, "Unauthorized");
            }
            const roomId = propertyId.toString();
            
            const now = Date.now();
            const lastTime = lastBidTime.get(userId.toString()) || 0;

            if (now - lastTime < BID_RATE_LIMIT) {
                return emitBidError(socket, "Too many bids");
            }

            lastBidTime.set(userId.toString(), now);

            const property = await Property.findById(propertyId);
            if (!property) {
                return emitBidError(socket, "Property not found");
            }

            if (property.seller.toString() === userId.toString()) {
                return emitBidError(socket, "You cannot bid on your own property");
            }

            if(property.status !== "approved" || property.auction?.status !== "approved"){
                return emitBidError(socket, "Auction not available yet");
            }

            if(!property.auction?.isAuction){
                return emitBidError(socket, "Auction not found");
            }

            const currentBid = property.auction.currentBid ?? 0;
            const startPrice = property.auction.startPrice ?? 0;

            const bidAmount = calculateBidAmount(currentBid, startPrice, {
                amount, increment, percent
            });

            const finalBidAmount = Math.round(bidAmount);
            
            if (!finalBidAmount || finalBidAmount <= 0) {
                return emitBidError(socket, "Invalid bid amount");
            }
            if (property.auction.endTime && property.auction.endTime < new Date()) {
                return emitBidError(socket, "Auction ended");
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
                return emitBidError(socket, "Bid too low or invalid auction");
            }
            const dateNow = new Date();
            let endTime = updatedProperty.auction?.endTime;

            if (endTime && endTime.getTime() - dateNow.getTime() < AUCTION_EXTENDED) {

                updatedProperty.auction!.endTime = new Date(dateNow.getTime() + AUCTION_EXTENDED);

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

            const bidResponse = mapBidHistory(populatedBid);

            io.to(roomId).emit("newBid", {
                bid: bidResponse,
                currentBid: updatedProperty.auction?.currentBid,
                totalBids: updatedProperty.auction?.totalBids,
                endTime: updatedProperty.auction?.endTime,
                status: getAuctionStatus(updatedProperty.auction?.endTime)
            });
        } catch (error) {
            emitBidError(socket, "Server error");
        }
    });

    socket.on("disconnect", () => {
        const userId = socket.data.user?._id?.toString();
        if (userId) lastBidTime.delete(userId);
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

        clearAuctionTimer(propertyId);
        
        const winner = highestBid?.user;
        const amount = highestBid?.amount || property.auction.startPrice;
        
        if (winner) {
            await createNotificationForUser({
                userId: winner._id.toString(),
                title: "Congrats you won the auction!",
                body: `You've won the auction with price ${amount}`,
                type: "message",
                action: {
                    screen: "PropertyDetails",
                    entityId: propertyId.toString(),
                    extra: { 
                        openAuctionTab: true,
                        property: property,
                    }
                }
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
                type: "message",
                action: {
                    screen: "PropertyDetails",
                    entityId: propertyId.toString(),
                    extra: { 
                        openAuctionTab: true,
                        property: property
                    }
                }
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