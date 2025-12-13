import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";

const router = express.Router();

router.get("/properties/pending", verifyToken, verifyAdmin);

export default router;