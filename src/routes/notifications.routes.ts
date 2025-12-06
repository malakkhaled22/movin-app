import  express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addNotification, clearNotifications, getNotifications, markAsRead, markAllAsRead, getMessageNotifications, getAlertNotifications } from "../controllers/notifications.controller";

const router = express.Router();

router.post("/add", verifyToken, addNotification);
router.get("/all", verifyToken, getNotifications);
router.get("/messages", verifyToken, getMessageNotifications);
router.get("/alerts", verifyToken, getAlertNotifications);
router.patch("/read-all",verifyToken ,markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/clear", verifyToken, clearNotifications);
export default router;