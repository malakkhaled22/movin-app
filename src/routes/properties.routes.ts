import express from "express";
import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getOneProperty,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { isSeller } from "../middlewares/role.guard.middleware";


const router = express.Router();

router.post("/properties/create", verifyToken, createProperty);
router.patch("/properties/:id", verifyToken, updateProperty);
router.delete("/properties/:id", verifyToken, deleteProperty);
router.get("/properties/getAll", verifyToken, getAllProperties);
router.get("/properties/getOneProduct/:id" , verifyToken , getOneProperty);

export default router;