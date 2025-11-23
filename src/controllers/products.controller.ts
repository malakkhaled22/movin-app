import { Product } from "../models/products";
import { Request, Response } from "express";
import User from "../models/user.model";
export const addproduct = async (req: Request, res: Response) => {
  const { model }: any = req.body;
  if (!req.user) return res.status(401).json({ message: "No user" });
  const sellerId = (req.user as any)._id;
  const seller = await User.findById({ sellerId });
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  const product = await Product.create({
    model,
    userId: sellerId,
    seller,
  });
  product.save();
  res.status(200).json({ message: "product created", product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.body;
  const sellerId = (req.user as any)._id;
  if (!sellerId) {
    return res.status(404).json({ message: "seller not Found" });
  }
  if (!productId) {
    return res.status(404).json({ message: "product not Found" });
  }

  const deletedProduct = await Product.findByIdAndDelete({ _id:productId , seller: sellerId});
  if (!deletedProduct) {
    return res.status(401).json({ message: "product not found to delete" });
  }
  res.status(201).json({ message: "product deleted", deletedProduct});
};
