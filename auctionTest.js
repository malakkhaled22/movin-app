const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZiZDRmMGE3ZTU5OWQxMWM4YWE3YTkiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOnRydWUsImlzQnV5ZXIiOmZhbHNlLCJpYXQiOjE3Nzg0ODIxNDgsImV4cCI6MTc3ODQ4OTM0OH0.hAh1G4TP9Z9QGKEC8r5wVpFuCYlV_WXlrWdSxwIZi4c"
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
      increment: 5000
    });
  }, 3000);
});

socket.on("connect_error", (err) => {
  console.log("❌ connect_error:", err.message);
});

socket.on("auctionData", (data) => console.log("📦 auctionData:", data));
socket.on("newBid", (data) => console.log("🔥 newBid:", data));
socket.on("auctionExtended", (data) => console.log("⏳ auctionExtended:", data));
socket.on("auctionEnded", (data) => console.log("🏁 auctionEnded:", data));

socket.on("bidError", (err) => console.log("❌ bidError:", err));
socket.on("auctionError", (err) => console.log("❌ auctionError:", err));