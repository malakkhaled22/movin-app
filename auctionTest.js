const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZkMDY0OTBiOGFkYjZkNWIzNjIzM2EiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOmZhbHNlLCJpc0J1eWVyIjp0cnVlLCJpYXQiOjE3NzgxODk5NzIsImV4cCI6MTc3ODE5MDg3Mn0.SLaqW9yzqcroHIrl5bvs43HBpneKtQ2owfvrCc6Xqq8"
    }
});

const PROPERTY_ID = "69fbcbcc5fa764a6d10f2643";
const USER_ID = "69f20223af1739d7064fa5cd";

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    socket.emit("joinAuction", PROPERTY_ID);

    setTimeout(() => {
        console.log("📌 Sending bid...");
        socket.emit("placeBid", {
            propertyId: PROPERTY_ID,
            percent: 5,
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