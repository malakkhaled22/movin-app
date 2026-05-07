import { IProperty, Property } from "../models/property.model";
import { Request, Response } from "express";
import User from "../models/user.model";
import cloudinary from "../config/cloudinary";
import PropertyView from "../models/propertyView.model";
import { createNotificationForUser } from "../services/notifications.service";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "No user found" });
    if (!user.isSeller) {
      return res.status(403).json({ message: "Only sellers can add properties" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 3) {
      return res.status(400).json({
        message: "Minimum 3 images are required"
      });
    }

    if (files.length > 12) {
      return res.status(400).json({
        message: "Maximum 12 images are allowed"
      });
    }
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
    const coordinates = typeof req.body.coordinates === "string"
      ? JSON.parse(req.body.coordinates)
      : req.body.coordinates;

      if (!coordinates || coordinates.latitude === undefined || coordinates.longitude === undefined) {
          return res.status(400).json({
            message: "Coordinates are required"
          });
      }
    const newProperty = await Property.create({
      ...req.body,
      title: req.body.title,
      coordinates: coordinates,
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
    await createNotificationForUser({
            userId: user._id.toString(),
            title: "Your property has been created ✅",
            body: "Your property has been created successfully and is pending approval.",
            type: "alert",
            action: {
                    screen: "SellerPropertyDetails",
                    entityId: newProperty.id.toString(),
                }
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
    const propertyId  = req.params["propertyId"];
    const sellerId = (req.user as any)._id;

    if (!propertyId) return res.status(400).json({ message: "Property ID required" });

    const property = await Property.findOne({ _id: propertyId, seller: sellerId });
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

    await Property.findByIdAndDelete(propertyId);

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
    const propertyId  = req.params["propertyId"];
    const sellerId = req.user._id;
    const property = await Property.findOne({
      _id: propertyId,
      seller: sellerId
    });

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (req.body.auction) 
      return res.status(400).json({ message: "Auction data cannot be updated" });

    const allowedFields : (keyof IProperty)[] = [
      "title",
      "location",
      "description",
      "price",
      "type",
      "listingType",
      "size",
      "details",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (property as any)[field] = req.body[field];
      }
    }
    if (req.body.coordinates) {
      property.coordinates =
        typeof req.body.coordinates === "string"
          ? JSON.parse(req.body.coordinates)
          : req.body.coordinates;
    }
    if (req.files && req.files.length > 0) {
      if (req.files.length < 3) {
        return res.status(400).json({
          message: "Minimum 3 images are required"
        });
      }
      if (req.files.length > 12) {
        return res.status(400).json({
          message: "Maximum 12 images are allowed"
        });
      }
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

    await createNotificationForUser({
      userId: sellerId.toString(),
      title: "Your property has been updated ✅",
      body: "Your property has been updated successfully.",
      type: "alert",
      action: {
        screen: "SellerPropertyDetails",
        entityId: propertyId.toString(),
      }
    });

    return res.status(200).json({
      message: "Property updated successfully",
      property,
    });

  } catch (error) {
    console.error("Update Property Error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (!seller.isSeller) return res.status(403).json({ message: "Unauthorized" });

    const properties = await Property.find({ seller: sellerId });

    return res.status(200).json({
      message: "Properties fetched successfully",
      properties,
    });

  } catch (error) {
    console.error("Get All Properties Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOneProperty = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;
    const propertyId = req.params["propertyId"];

    if (!sellerId) return res.status(404).json({ message: "User not found" });

    const property = await Property.findOneAndUpdate(
    {
      _id: propertyId, seller: sellerId,
    },
    {
      $inc: { views: 1 }
    },
    {
      new: true
    }
  );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json(property);
  } catch (error) {
    console.error("Get One Property Error:", error);
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

export const searchPropertyByLocation = async (req: Request, res: Response) => {
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

export const getPropertyByListingType = async (req: Request, res: Response) => {
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

export const getPropertyDetailsForBuyer = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params["propertyId"];
    const userId = (req.user as any)._id;

    const property = await Property.findOneAndUpdate(
      {_id: propertyId, status: "approved" },
      {$inc: { views: 1 } },
      { new: true }
    ).populate("seller", "username email phone location");
    
    if(!property) return res.status(404).json({message: "Property not found"});

    await PropertyView.create({
      property: propertyId,
      seller: (property?.seller as any)?._id,
      viewer: userId || null,
    }); 

    if(!property) return res.status(404).json({message: "Property not found"});

    return res.status(200).json({
      property,
    });

  } catch (error) {
    console.error("Error in Get Property Details: ", error);
    return res.status(500).json("Internal Server Error");
  }
};

export const getSellerMostViewedProps = async (req: Request, res: Response) => {
  try {
    const sellerId = (req.user as any)._id;

    const properties = await Property.find({
      seller: sellerId,
      status: "approved",
    })
    .sort({ views: -1 })
    .limit(5)
    .select("location type price views images createdAt");

    return res.status(200).json({
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error("Error in get seller most viewed properties", error);
    return res.status(500).json({message: "Internal Server Error"});
  }
};