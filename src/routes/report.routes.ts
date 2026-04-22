import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { createReport, getMyReports } from "../controllers/report.controller";

const router = Router();

router.post("/", verifyToken, createReport);
router.get("/my", verifyToken, getMyReports);


export default router;