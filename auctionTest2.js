const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZhNmU0Y2I2MmExZTIxYjE3YjQ4NDkiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOmZhbHNlLCJpc0J1eWVyIjp0cnVlLCJpYXQiOjE3Nzg0ODIyMTcsImV4cCI6MTc3ODQ4OTQxN30.DC5OhrKpYpUMzXl-9JFbRZctED0bqBFFGAXm0kaw0EQ"
    }
});

const PROPERTY_ID = "6a016c7992f90c79fd9306ca";

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    socket.emit("joinAuction", PROPERTY_ID);

    setTimeout(() => {
        console.log("📌 Sending bid...");
        socket.emit("placeBid", {
            propertyId: PROPERTY_ID,
            increment: 500
        });
    }, 3000);
});

socket.on("auctionData", (data) => console.log("📦 auctionData:", data));
socket.on("newBid", (data) => console.log("🔥 newBid:", data));
socket.on("auctionExtended", (data) => console.log("⏳ auctionExtended:", data));
socket.on("auctionEnded", (data) => console.log("🏁 auctionEnded:", data));

socket.on("bidError", (err) => console.log("❌ bidError:", err));
socket.on("auctionError", (err) => console.log("❌ auctionError:", err));