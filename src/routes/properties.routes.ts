import express from "express";
import {
  createProperty,
  deleteProperty,
  filterProperties,
  getAllProperties,
  getOneProperty,
  getPropertyByListingType,
  getPropertyDetailsForBuyer,
  getRecentProperties,
  getSellerMostViewedProps,
  searchPropertyByLocation,
  updateProperty
} from "../controllers/properties.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/uploadProperty.middleware";
import { clearBuyerViewHistory, getBuyerViewHistory, getSellerDashboardStats, getSellerViewsChart } from "../controllers/propertyViews.controller";
import { isBuyer, isSeller } from "../middlewares/role.guard.middleware";

const router = express.Router();

router.post("/properties/create", verifyToken, isSeller, upload.array("images", 12), createProperty);
router.patch("/properties/:propertyId", verifyToken, isSeller, upload.array("images", 12), updateProperty);
router.delete("/properties/:propertyId", verifyToken, isSeller, deleteProperty);
router.get("/properties/getAll", verifyToken, isSeller, getAllProperties);
router.get("/properties/getOne/:propertyId", verifyToken, isSeller, getOneProperty);

router.get("/properties/search", verifyToken, searchPropertyByLocation);
router.get("/properties/recent-properties", verifyToken, getRecentProperties);
router.get("/properties/listing-type", verifyToken, getPropertyByListingType);
router.get("/properties/filter", verifyToken, filterProperties);

router.get("/properties/most-viewed", verifyToken, isSeller, getSellerMostViewedProps);
router.get("/views-chart", verifyToken, isSeller, getSellerViewsChart);
router.get("/dashboard-stats", verifyToken, isSeller, getSellerDashboardStats);

router.delete("/view-history/clear", verifyToken, isBuyer, clearBuyerViewHistory);
router.get("/view-history", verifyToken, isBuyer, getBuyerViewHistory);
router.get("/properties/:propertyId", verifyToken, isBuyer, getPropertyDetailsForBuyer);

export default router;