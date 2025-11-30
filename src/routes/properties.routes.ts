import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Product } from "../models/property.model";

const router = express.Router();

router.post("/properties/create", verifyToken, createProperty);
router.patch("/properties/:id", verifyToken, updateProperty);
router.delete("/properties/:id", verifyToken, deleteProperty);
router.get("/properties/getAll", verifyToken, getAllProperties);

router.get("/properties/my", verifyToken, async (req, res) => {
    const user = (req as any).user;

    if (!user.isSeller) {
        return res.status(403).json({ message: "Only sellers can view their properties" });
    }

    const properties = await Product.find({ seller: user._id });
    res.json(properties);
});

export default router;