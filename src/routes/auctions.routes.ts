import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { createAuctionForProperty, getAllAuctionProperties, getAuctionDetails } from "../controllers/auctions.controller";

const router = express.Router();

router.get("/auctions/:propertyId", verifyToken, getAuctionDetails);

router.get("/auctions", verifyToken, getAllAuctionProperties);
router.put("/auction/create", verifyToken, createAuctionForProperty);
export default router;