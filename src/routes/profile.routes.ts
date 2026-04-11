import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getUserProfile, updateUserProfile } from "../controllers/profile.controller";

const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

export default router;