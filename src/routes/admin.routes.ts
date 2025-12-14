import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";
import { approveProperty, getPendingProperties, rejectProperty } from "../controllers/properties.controller";
import { getAdminStats } from "../controllers/admin.stats.controller";

const router = express.Router();

router.get("/properties/pending", verifyToken, verifyAdmin, getPendingProperties);
router.put("/properties/:id/approve", verifyToken, verifyAdmin, approveProperty);
router.put("/properties/:id/reject", verifyToken, verifyAdmin, rejectProperty);

router.get("/stats", verifyAdmin, verifyToken, getAdminStats);
export default router;