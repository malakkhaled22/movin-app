import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getAuctionDetails } from "../controllers/auctions.controller";

const router = express.Router();

router.get("/auctions/:propertyId", verifyToken, getAuctionDetails);

export default router;