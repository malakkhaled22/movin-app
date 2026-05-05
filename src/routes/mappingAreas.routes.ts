import express from "express";
import { getPropertyMetadata } from "../controllers/mappingAreas.controller";


const router = express.Router();

router.post("/properties/metadata", getPropertyMetadata);

export default router;