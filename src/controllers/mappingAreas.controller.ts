import { Request, Response } from "express";
import { AREAS_MAPPING, PROPERTY_TYPES } from "../constants/areas-mapping";

export const getPropertyMetadata = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({
            property_types: PROPERTY_TYPES,
            areas: AREAS_MAPPING
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching property metadata" });
    }
};