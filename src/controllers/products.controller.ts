import { Product } from "../models/products";
import { Request, Response } from "express";
import User from "../models/user.model";

export const addproduct = async (req: Request, res: Response) => {
  const { model }: any = req.body;
  if (!req.user) return res.status(401).json({ message: "No user" });
  const sellerId = (req.user as any)._id;
  console.log(sellerId);
  const seller = await User.findById(sellerId);
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  if (!seller.isSeller) {
    seller.isSeller = true;
    await seller.save();
  }
  if (seller.isSeller === true) {
    const product = await Product.create({
      ...model,
      seller: sellerId,
    });
    res.status(201).json({ message: "product created", product });
  } else {
    return res.status(401).json({ message: "you are not a seller" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(404).json({ message: "product id is missed" });
  }
  const sellerId = (req.user as any)._id;
  const seller = await User.findById(sellerId);
  if (!seller) {
    return res.status(404).json({ message: "seller not Found" });
  }
  if (seller.isSeller === true) {
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      seller: sellerId,
    });
    if (!deletedProduct) {
      return res.status(401).json({ message: "product not found to delete" });
    }
    res.status(200).json({ message: "product deleted", deletedProduct });
  } else {
    return res.status(401).json({ message: "you are not a seller" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId, ...updateFields } = req.body;
    const sellerId = (req.user as any)._id;
    if (!productId) {
      return res.status(404).json({ message: "product id is required" });
    }
    const seller = await User.findById(sellerId);
   

    if (!seller) {
      return res.status(404).json({ message: "seller not Found" });
    }

     const product = await Product.findOne({ _id: productId, seller: sellerId });

    if (seller.isSeller === true) {
      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      console.log(updateFields);
      
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, seller: sellerId },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "product not Found" });
      }
      res
        .status(200)
        .json({ message: "product updated", product: updatedProduct });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (!seller.isSeller) {
      return res.status(403).json({ message: "You are not a seller" });
    }

    const products = await Product.find({ seller: sellerId });

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
