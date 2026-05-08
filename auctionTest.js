const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZiZDRmMGE3ZTU5OWQxMWM4YWE3YTkiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOmZhbHNlLCJpc0J1eWVyIjp0cnVlLCJpYXQiOjE3NzgxOTU2NjMsImV4cCI6MTc3ODE5NjU2M30.Xs9qE8KudgonPqvE98HWAOoLLd6cLY9VAoZU5RaFLpA"
    }
});

const PROPERTY_ID = "69fd17889557999d2747a6f5";
const USER_ID = "69f20223af1739d7064fa5cd";

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    socket.emit("joinAuction", PROPERTY_ID);

    setTimeout(() => {
        console.log("📌 Sending bid...");
        socket.emit("placeBid", {
            propertyId: PROPERTY_ID,
            percent: 10,
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