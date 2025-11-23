import express from "express";
import {
  addproduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/products.controller";
import { verifyToken } from "../middlewares/auth.middleware";
export const productRoute = express.Router();
productRoute.post("/createProduct", verifyToken, addproduct);
productRoute.patch("/updateProduct", verifyToken, updateProduct);
productRoute.delete("/deleteProduct", verifyToken, deleteProduct);
productRoute.get("/getAllProducts", verifyToken, getAllProducts);
