import express from "express";
import { switchRole } from "../controllers/switchRole.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.guard.middleware";
import { chooseRole } from "../controllers/roles.controller";

const router = express.Router();

router.put("/switch-role", verifyToken, switchRole);
router.put("/choose-role", verifyToken, chooseRole);
export default router;