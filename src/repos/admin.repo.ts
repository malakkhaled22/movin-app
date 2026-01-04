import User from "../models/user.model";
import { SortOrder } from "mongoose";

export const blockuser = async (id: string, blocked: boolean) => {
  return User.findByIdAndUpdate(id, { isBlocked: blocked }, { new: true });
};

export const getUsers = async (
  page: number,
  limit: number,
  sortBy: string,
  order: SortOrder
) => {
  const skip = (page - 1) * limit;


  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: order })
    .select("-password"); 

  const totalUsers = await User.countDocuments();

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page
  };
};

export const getBlockedUsers = async (
  page: number,
  limit: number,
  sortBy: string,
  order: SortOrder,
  blocked = false
) => {
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (blocked) filter.isBlocked = true;

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: order })
    .select("-password");

  const totalUsers = await User.countDocuments(filter);

  return {
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page
  };
};