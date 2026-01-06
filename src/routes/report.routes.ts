import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { createReport, getAllReports, getMyReports, updateReportStatus } from "../controllers/report.controller";
import { verifyAdmin } from "../middlewares/admin.middleware";


const router = Router();

//user
router.post("/", verifyToken, createReport);
router.get("/my", verifyToken, getMyReports);

//admin
router.get("/admin/all", verifyToken, verifyAdmin, getAllReports);
router.patch("/admin/:id/status", verifyToken, verifyAdmin, updateReportStatus);

export default router;