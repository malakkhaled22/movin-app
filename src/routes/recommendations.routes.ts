import { getRecommendations } from "../controllers/recommendations.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.get("/all", verifyToken, getRecommendations);

export default router;