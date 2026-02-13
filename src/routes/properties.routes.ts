import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getOneProperty,
  updateProperty
} from "../controllers/properties.seller.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/uploadProperty.middleware";

const router = express.Router();

router.post("/properties/create", verifyToken, upload.array("images", 10), createProperty);
router.patch("/properties/:id", verifyToken, upload.array("images", 10), updateProperty);
router.delete("/properties/:id", verifyToken, deleteProperty);
router.get("/properties/getAll", verifyToken, getAllProperties);
router.get("/properties/getOne/:id" , verifyToken , getOneProperty);

export default router;