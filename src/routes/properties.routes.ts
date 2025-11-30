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

export default router;