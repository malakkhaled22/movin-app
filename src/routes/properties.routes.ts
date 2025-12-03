import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { isSeller } from "../middlewares/role.guard.middleware";

const router = express.Router();

router.post("/properties/create", verifyToken, isSeller, createProperty);
router.patch("/properties/:id", verifyToken, isSeller, updateProperty);
router.delete("/properties/:id", verifyToken, isSeller, deleteProperty);
router.get("/properties/getAll", verifyToken, isSeller, getAllProperties);

export default router;