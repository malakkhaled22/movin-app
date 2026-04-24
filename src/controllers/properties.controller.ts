import { Property } from "../models/property.model";
import { Request, Response } from "express";
import User from "../models/user.model";
import cloudinary from "../config/cloudinary";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "No user found" });
    if (!user.isSeller) {
      return res.status(403).json({ message: "Only sellers can add properties" });
    }

    const files = req.files as Express.Multer.File[];
    const images: any[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "movin/properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }
    
    const newProperty = await Property.create({
      ...req.body,
      images,
      seller: user._id,
      status: "pending",
      auction: req.body.auction
      ? {
          isAuction: req.body.auction.isAuction ?? false,
          status: "pending",
          startPrice: req.body.auction.startPrice ?? 0,
          currentBid: req.body.auction.startPrice ?? 0,
          startTime: req.body.auction.startTime ? new Date(req.body.auction.startTime) : undefined,
          endTime: req.body.auction.endTime ? new Date(req.body.auction.endTime) : undefined,
          totalBids: 0,
        }
      : undefined,
    });

    res.status(201).json({
      message: "Property created successfully, pending approval",
      property: newProperty,
    });

  } catch (error) {
    console.error("Create Property Error:", error);
    res.status(500).json({ message: "Error creating property" });
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
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProperty = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const property = await Property.findOne({ _id: id, seller: sellerId });
    if (!property) return res.status(404).json({ message: "Property not found" });

    Object.assign(property, req.body);

    if (req.files && req.files.length > 0) {

      for (const img of property.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      const files = req.files as Express.Multer.File[];
      const images: any[] = [];

      for (const file of files) {
        const result: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "movin/properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
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
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (!seller.isSeller) return res.status(403).json({ message: "Unauthorized" });

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

    if (!sellerId) return res.status(404).json({ message: "User not found" });

    const product = await Property.findByIdAndUpdate({
      _id: productId,
      seller: sellerId,
    },
      {$inc: {views: 1}},
    );

    if (!product) return res.status(404).json({ message: "Property not found" });

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const filterProperties = async (req: Request, res: Response) => {
  try {
    const {
      location,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      area,
      pool,
      sort
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let filter: any = { status: "approved" };

    if (location){
      filter.location = {$regex: location, $options: "i" };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice)
        filter.price.$gte = Number(minPrice);
      if (maxPrice)
        filter.price.$lte = Number(maxPrice);
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (area) {
      filter["details.area"] = Number(area);
    }

    if (type === "apartment" || type === "penthouse") {
      if (bedrooms)
        filter["details.bedrooms"] = bedrooms;
      if (bathrooms)
        filter["details.bathrooms"] = bathrooms;
    }

    if (type === "villa") {
      if (bedrooms)
        filter["details.bedrooms"] = bedrooms;
      if (bathrooms)
        filter["details.bathrooms"] = bathrooms;
      if (pool)
        filter["details.pool"] = pool;
    }
    
    let sortOption: any = { createdAt: -1 };
    if (sort === "price-asc")
      sortOption = { price: 1 };
    if (sort === "price-desc")
      sortOption = { price: -1 };
    if (sort === "newest")
      sortOption = { createdAt: -1 };

    const properties = await Property.find(filter)
      .populate("seller", "username email")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await Property.countDocuments(filter);

    let locationTotalCount = null;

    if(location){
      locationTotalCount = await Property.countDocuments({
        status: "approved",
        location: {$regex: location, $options: "i" }
      });
    }

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      properties,
      locationTotalCount,
    });
  } catch (error) {
    console.error("Filter properties Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchPropertyLocation = async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string;
    const userId = (req.user as any)._id;

    if (!location) return res.status(400).json({ message: "Location required" });

    const properties = await Property.find({
      location: { $regex: location, $options: "i" },
      status: "approved"
    });

    if (req.user) {
      const user = await User.findById(userId);
      if (!user) return;

      const existing = user.searchHistory?.find(
        (s) => s.location === location
      );

      if (existing) {
        existing.count += 1;
      } else {
        user.searchHistory?.push({
          location,
          count: 1
        });
      }
      await user.save();
    }
    return res.status(200).json({ results: properties });
  } catch (error) {
    console.error("Search location error", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const getRecentProperties = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(15);
    if (!properties) return res.status(404).json({ message: "Properties not found" });
    return res.status(200).json({ recentProperties: properties });
  } catch (error) {
    console.error("Get recent properties error ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPropertyByType = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;

    if (!type) return res.status(404).json({ message: "Type is required" });

    const properties = await Property.find({
      listingType: { $regex: type, $options: "i" },
      status: "approved"
    });

    return res.status(200).json({ results: properties });
  } catch (error) {
    console.error("properties by type error", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};