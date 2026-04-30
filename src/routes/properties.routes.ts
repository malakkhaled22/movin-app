import express from "express";
import {
  createProperty,
  deleteProperty,
  filterProperties,
  getAllProperties,
  getOneProperty,
  getPropertyByType,
  getPropertyDetailsForBuyer,
  getRecentProperties,
  getSellerMostViewedProps,
  searchPropertyLocation,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/uploadProperty.middleware";
import { getSellerViewsChart } from "../controllers/propertyviewChart.controller";

const router = express.Router();

router.post("/properties/create", verifyToken, upload.array("images", 10), createProperty);
router.patch("/properties/:id", verifyToken, upload.array("images", 10), updateProperty);
router.delete("/properties/:id", verifyToken, deleteProperty);
router.get("/properties/getAll", verifyToken, getAllProperties);
router.get("/properties/getOne/:id", verifyToken, getOneProperty);

router.get("/properties/search", verifyToken, searchPropertyLocation);
router.get("/properties/recent-properties", verifyToken, getRecentProperties);
router.get("/properties/listing-type", verifyToken, getPropertyByType);
router.get("/properties/filter", verifyToken, filterProperties);

router.get("/properties/most-viewed", verifyToken, getSellerMostViewedProps);

router.get("/views-chart", verifyToken, getSellerViewsChart);

router.get("/properties/:id", verifyToken, getPropertyDetailsForBuyer);

export default router;