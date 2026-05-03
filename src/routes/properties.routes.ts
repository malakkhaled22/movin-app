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
import { clearBuyerViewHistory, getBuyerViewHistory, getSellerDashboardStats, getSellerViewsChart } from "../controllers/propertyViews.controller";
import { isBuyer, isSeller } from "../middlewares/role.guard.middleware";

const router = express.Router();

router.post("/properties/create", verifyToken, isSeller, upload.array("images", 10), createProperty);
router.patch("/properties/:id", verifyToken, isSeller, upload.array("images", 10), updateProperty);
router.delete("/properties/:id", verifyToken, isSeller, deleteProperty);
router.get("/properties/getAll", verifyToken, isSeller, getAllProperties);
router.get("/properties/getOne/:id", verifyToken, isSeller, getOneProperty);

router.get("/properties/search", verifyToken, searchPropertyLocation);
router.get("/properties/recent-properties", verifyToken, getRecentProperties);
router.get("/properties/listing-type", verifyToken, getPropertyByType);
router.get("/properties/filter", verifyToken, filterProperties);

router.get("/properties/most-viewed", verifyToken, isSeller, getSellerMostViewedProps);
router.get("/views-chart", verifyToken, isSeller, getSellerViewsChart);
router.get("/dashboard-stats", verifyToken, isSeller, getSellerDashboardStats);

router.delete("/view-history/clear", verifyToken, isBuyer, clearBuyerViewHistory);
router.get("/view-history", verifyToken, isBuyer, getBuyerViewHistory);
router.get("/properties/:id", verifyToken, isBuyer, getPropertyDetailsForBuyer);

export default router;