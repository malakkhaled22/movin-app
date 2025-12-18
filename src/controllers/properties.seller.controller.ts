import { Property } from "../models/property.model";
import { Request, Response } from "express";
import User from "../models/user.model";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "No user found" });
    if (!user.isSeller) {
      return res
        .status(403)
        .json({ message: "Only sellers can add properties" });
    }
    const newProperty = await Property.create({
      ...req.body,
      seller: user._id,
      status:"pending",
    });
    await newProperty.save();
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
    if (!id) {
      return res.status(404).json({ message: "Property id is required" });
    }
    const sellerId = (req.user as any)._id;
    if (!sellerId) return res.status(404).json({ message: "user not found" });
    const seller = await User.findById(sellerId);
    if (seller?.isSeller) {
      const deletedProperty = await Property.findOneAndDelete({
        _id: id,
        seller: sellerId, // ensures seller can only delete their own property
      });

      if (!deletedProperty) {
        return res
          .status(404)
          .json({ message: "Property not found or not owned by this seller" });
      }
      res
        .status(200)
        .json({ message: "Property deleted successfully", deletedProperty });
    } else {
      res.status(401).json({ message: "Unathourized" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ...updateFields } = req.body;
    const sellerId = (req.user as any)._id;

    if (!id) {
      return res.status(404).json({ message: "product id is required" });
    }
    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not Found" });
    }
    if (!seller.isSeller)
      return res.status(403).json({ message: "Unauthorized" });

    const updatedProperty = await Property.findOneAndUpdate(
      { _id: id, seller: sellerId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Product not Found" });
    }

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProperty });
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
