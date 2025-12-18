import User from "../models/user.model";
import { Request, Response } from "express";
import { blockuser, getBlockedUsers, getUsers } from "../repos/admin.repo";
import Property from "../models/property.model";


export const blockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params["id"];
    if (!userId) return res.status(404).json({ message: "user Id is missing" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    if (user.isBlocked)
      return res.status(200).json({ message: "user is already blocked" });
    const updated = blockuser(userId, true);
    res.status(200).json({
      message: "user blocked successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

export const unBlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params["id"];
    if (!userId) return res.status(404).json({ message: "user Id is missing" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    if (!user.isBlocked)
      return res.status(200).json({ message: "user already not blocked" });
    const updated = blockuser(userId, false);
    res.status(200).json({
      message: "user unblocked successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = (req.query.order as string) === "desc" ? -1 : 1;
  const allusers = await getUsers(page, limit, sortBy, order);
  res.status(200).json({
    message: "all users fetched successfully",
    ...allusers,
  });
};

export const getblockedUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = (req.query.order as string) === "desc" ? -1 : 1;
  const allusers = await getBlockedUsers(page, limit, sortBy, order , true);
  res.status(200).json({
    message: "all blocked users fetched successfully",
    ...allusers,
  });
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalBuyers,
            totalSellers,
            totalProperties,
            pendingProperties,
            approvedProperties,
            rejectedProperties,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isBuyer: true }),
            User.countDocuments({ isSeller: true }),
            Property.countDocuments(),
            Property.countDocuments({ status: "pending" }),
            Property.countDocuments({ status: "approved" }),
            Property.countDocuments({ status: "rejected" }),
        ]);

        return res.status(200).json({
            users: {
                total: totalUsers,
                buyers: totalBuyers,
                sellers: totalSellers
            },
            properties: {
                total: totalProperties,
                pending: pendingProperties,
                approved: approvedProperties,
                rejected: rejectedProperties,
            },
        });
    } catch (error) {
        console.error("Error in getting admin stats", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};