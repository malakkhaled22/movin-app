import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();
//Register user
router.post("/register", registerUser);
//Login user
router.post("/login", loginUser);
//logout user
router.post("/logout", verifyToken, logoutUser);
export default router;