import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllSellerProperties,
  getOneSellerProperty,
  getRecentProperties,
  searchPropertyLocation,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/uploadProperty.middleware";

const router = express.Router();

router.post("/properties/create", verifyToken, upload.array("images", 10), createProperty);
router.patch("/properties/:id", verifyToken, upload.array("images", 10), updateProperty);
router.delete("/properties/:id", verifyToken, deleteProperty);
router.get("/properties/getAll", verifyToken, getAllSellerProperties);
router.get("/properties/getOne/:id", verifyToken, getOneSellerProperty);
router.get("/properties/search", verifyToken, searchPropertyLocation);
router.get("/properties/recent-properties", verifyToken, getRecentProperties);

export default router;