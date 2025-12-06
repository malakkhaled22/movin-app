import User from "../models/user.model";
import { Request, Response } from "express";
import { blockuser, getBlockedUsers, getUsers } from "../repos/admin.repo";
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
      updated,
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
      updated,
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
