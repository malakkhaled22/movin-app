import { isBuyer } from "../middlewares/role.guard.middleware";
import { favoriteToggle } from "../controllers/favorite.controller";
import  express from "express";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/toggle/:propertyId", verifyToken, isBuyer, favoriteToggle);

export default router;
