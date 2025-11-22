import express from "express";
import { switchRole } from "../controllers/switchRole.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.guard.middleware";

const router = express.Router();

router.put("/switch-role", verifyToken, allowRoles("buyer", "seller"), switchRole);

export default router;