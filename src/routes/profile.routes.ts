import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { changePassword, getUserProfile, updateUserProfile } from "../controllers/profile.controller";

const router = express.Router();

router.get("/", verifyToken, getUserProfile);
router.put("/", verifyToken, updateUserProfile);

router.patch("/change-password", verifyToken, changePassword);
export default router;