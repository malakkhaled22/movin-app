import axios from "axios";
import { Request, Response } from "express";

export const predictPropertyPrice = async (req: Request, res: Response) => {
    try {
        const response = await axios.post("https://web-production-ab7718.up.railway.app/predict", {
            Size_sqm: req.body.Size_sqm,     
            Bedroom_Num: req.body.Bedroom_Num,     
            bathrooms_numeric: req.body.bathrooms_numeric, 
            is_land: req.body.is_land,             
            is_cash: req.body.is_cash,             
            main_area: req.body.main_area,         
            type: req.body.type,                   
            sub_area: req.body.sub_area           
        });

        const rawPrice = response.data.predicted_price;
        const roundedPrice = Number(rawPrice.toFixed(3));
        return res.status(200).json({
            predicted_price: roundedPrice
        });

    } catch (error: any) {
        console.error("AI Error:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Prediction failed",
            error: error.message
        });
    }
};