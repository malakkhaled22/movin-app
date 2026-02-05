import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { switchRole } from "../controllers/roles.controller";
import { chooseRole } from "../controllers/roles.controller";

const router = express.Router();

router.put("/switch-role", verifyToken, switchRole);
router.put("/choose-role", verifyToken, chooseRole);
export default router;