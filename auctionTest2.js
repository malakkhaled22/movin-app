const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

const PROPERTY_ID = "69dad4f33b3cd7d9a04258e4";
const USER_ID = "69ce47ca3260b566ba8bb20f";

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    socket.emit("joinAuction", PROPERTY_ID);

    setTimeout(() => {
        console.log("📌 Sending bid...");
        socket.emit("placeBid", {
            propertyId: PROPERTY_ID,
            amount: 26000000,
            userId: USER_ID
        });
    }, 3000);
});

socket.on("auctionData", (data) => console.log("📦 auctionData:", data));
socket.on("newBid", (data) => console.log("🔥 newBid:", data));
socket.on("auctionExtended", (data) => console.log("⏳ auctionExtended:", data));
socket.on("auctionEnded", (data) => console.log("🏁 auctionEnded:", data));

socket.on("bidError", (err) => console.log("❌ bidError:", err));
socket.on("auctionError", (err) => console.log("❌ auctionError:", err));