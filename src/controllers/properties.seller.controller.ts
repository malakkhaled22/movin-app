import { Property } from "../models/property.model";
import { Request, Response } from "express";
import User from "../models/user.model";
import cloudinary from "../config/cloudinary";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "No user found" });
    if (!user.isSeller) {
      return res
        .status(403)
        .json({ message: "Only sellers can add properties" });
    }

    const files = req.files as Express.Multer.File[];
    
    const images = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "movin/properties",
      });

      images.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const newProperty = await Property.create({
      ...req.body,
      images,
      seller: user._id,
      status:"pending",
    });


    res.status(201).json({
      message: "Property created successfully, pending approval",
      property: newProperty,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating property", error });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = (req.user as any)._id;

    if (!id) return res.status(400).json({ message: "Property ID required" });

    const property = await Property.findOne({ _id: id, seller: sellerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const seller = await User.findById(sellerId);
    if (!seller || !seller.isSeller) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    for (const img of property.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Property and all images deleted successfully",
    });

  } catch (error) {
    console.error("Delete Property Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const updateProperty = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const property = await Property.findOne({ _id: id, seller: sellerId });
    if (!property) return res.status(404).json({ message: "Property not found" });

    
    const updateFields = req.body;
    Object.assign(property, updateFields);

    if (req.files && req.files.length > 0) {
    
      for (const img of property.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      
      const files = req.files as Express.Multer.File[];
      const images = [];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "movin/properties",
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      property.images = images;
    }

    await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (!seller.isSeller) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const products = await Property.find({ seller: sellerId });

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOneProperty = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;
    const productId = req.params["id"];
    if (!sellerId) return res.status(404).json({ message: "user not found" });
    const product = await Property.findOne({ _id: productId , seller: sellerId });
    if (!product) return res.status(404).json({ message: "product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};
