const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWZiZDRmMGE3ZTU5OWQxMWM4YWE3YTkiLCJpc0FkbWluIjpmYWxzZSwiaXNTZWxsZXIiOmZhbHNlLCJpc0J1eWVyIjp0cnVlLCJpYXQiOjE3Nzg0MzYzOTEsImV4cCI6MTc3ODQ0MzU5MX0.uniaclqp0O6LWXhXQo_-xjGLgO7EFEomnwH_nfxodr0"
  }
});

const PROPERTY_ID = "69ff8b6bcef19414168a5ecf";

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("joinAuction", PROPERTY_ID);

  setTimeout(() => {
    console.log("📌 Sending bid...");
    socket.emit("placeBid", {
      propertyId: PROPERTY_ID,
      percent: 10
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