const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZiZDRmMGE3ZTU5OWQxMWM4YWE3YTkiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOmZhbHNlLCJpc0J1eWVyIjp0cnVlLCJpYXQiOjE3NzgxOTAwMjksImV4cCI6MTc3ODE5MDkyOX0.m4lXUp9owdU-Hn8uJ_t_krIXE-3sFwjDmYUvINi-2Ug"
    }
});

const PROPERTY_ID = "69fbcbcc5fa764a6d10f2643";
const USER_ID = "69e8a9cd5c2c3108e605fc3d";

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    socket.emit("joinAuction", PROPERTY_ID);

    setTimeout(() => {
        console.log("📌 Sending bid...");
        socket.emit("placeBid", {
            propertyId: PROPERTY_ID,
            increment: 500,
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