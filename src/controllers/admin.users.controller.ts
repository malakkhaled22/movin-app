import User from "../models/user.model";
import { Request, Response } from "express";
import { blockOrUnblockUser, getAdminStatsService, getUsersWithPagination } from "../services/adminUser.service";
import Property from "../models/property.model";


export const blockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params["id"];

    const user = await blockOrUnblockUser(userId, true);
    if (!user)
      return res.status(404).json({ message: "user not found" });

    if (user.isBlocked)
      return res.status(200).json({ message: "user is already blocked" });

    res.status(200).json({ message: "user blocked successfully" });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

export const unBlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params["id"];
    const user = await blockOrUnblockUser(userId, false);

    if (!user)
      return res.status(404).json({ message: "user not found" });

    if (!user.isBlocked)
      return res.status(200).json({ message: "user already unblocked" });

    res.status(200).json({ message: "user unblocked successfully" });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = (req.query.order as string) === "desc" ? -1 : 1;

  const result = await getUsersWithPagination(page, limit, sortBy, order);
  res.status(200).json({
    message: "all users fetched successfully",
    result,
  });
};

export const getblockedUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = (req.query.order as string) === "desc" ? -1 : 1;

  const result = await getUsersWithPagination(page, limit, sortBy, order, true);
  res.status(200).json({
    message: "all blocked users fetched successfully",
    result,
  });
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await getAdminStatsService();

        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error in getting admin stats", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
