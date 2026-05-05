import express from "express";
import { predictPropertyPrice } from "../controllers/aiPrediction.controller";

const router = express.Router();

router.post("/predict", predictPropertyPrice);

export default router;