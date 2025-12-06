import { isBuyer } from "../middlewares/role.guard.middleware";
import  express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addFavorite, clearAllFavorites, getAllFavorites, removeFavorite } from "../controllers/favorite.controller";

const router = express.Router();

router.post("/favorites/:propertyId", verifyToken, isBuyer, addFavorite);
router.delete("/favorites/:propertyId", verifyToken, isBuyer, removeFavorite);
router.get("/favorites/get/all", verifyToken, isBuyer, getAllFavorites);
router.delete("/favorites/clear/all", verifyToken, isBuyer, clearAllFavorites);

export default router;
