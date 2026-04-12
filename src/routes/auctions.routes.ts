import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getAllAuctionProperties, getAuctionDetails } from "../controllers/auctions.controller";

const router = express.Router();

router.get("/auctions/:propertyId", verifyToken, getAuctionDetails);

router.get("/auctions", verifyToken, getAllAuctionProperties);
export default router;