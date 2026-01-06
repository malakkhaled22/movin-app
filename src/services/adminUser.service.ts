import Property from "../models/property.model";
import User from "../models/user.model";
import { SortOrder } from "mongoose";

export const getUsersWithPagination = async (
  page: number,
  limit: number,
  sortBy: string,
  order: SortOrder,
  isBlocked?: boolean
) => {
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (isBlocked !== undefined) filter.isBlocked = isBlocked;

  const [users, total] = await Promise.all([
    User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: order }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const blockOrUnblockUser = async (userId: string, status: boolean) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: { isBlocked: status } },
    {
      new: true,
      runValidators: false,
    }
  );
};

export const getAdminStatsService = async () => {
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

  return {
    users: {
      total: totalUsers,
      buyers: totalBuyers,
      sellers: totalSellers,
    },
    properties: {
      total: totalProperties,
      pending: pendingProperties,
      approved: approvedProperties,
      rejected: rejectedProperties,
    },
  };
};