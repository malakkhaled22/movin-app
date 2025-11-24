import express from "express";
import { switchRole } from "../controllers/switchRole.controller";
import { loginUser, registerUser } from "../controllers/auth.controller";

const router = express.Router();
//Register user
router.post("/register", registerUser);
//Login user
router.post("/login", loginUser);
export default router;