import Property from "../models/property.model";
import Report from "../models/report.model";
import User from "../models/user.model";

export const getUsersWithPagination = async (
  page: number,
  limit: number,
  isBlocked?: boolean
) => {
  const skip = (page - 1) * limit;

  const filter: any = {isAdmin: "false"};
  if (isBlocked !== undefined) filter.isBlocked = isBlocked;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
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
    totalReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBuyer: true }),
    User.countDocuments({ isSeller: true }),
    Property.countDocuments(),
    Property.countDocuments({ status: "pending" }),
    Property.countDocuments({ status: "approved" }),
    Property.countDocuments({ status: "rejected" }),
    Report.countDocuments(),
  ]);

  const months = 6;

  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - months))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const propertyGrowth = await Property.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - months))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const labels: string[] = [];
  const usersData: number[] = [];
  const propertiesData: number[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthName = date.toLocaleString("en-US", { month: "short" });
    labels.push(monthName);

    const userMonth = userGrowth.find(
      (u) => u._id.year === year && u._id.month === month
    );
    const propertyMonth = propertyGrowth.find(
      (p) => p._id.year === year && p._id.month === month
    );

    usersData.push(userMonth ? userMonth.count : 0);
    propertiesData.push(propertyMonth ? propertyMonth.count : 0);
  }

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
    reports: {
      total: totalReports,
    },
    growthData: {
      labels,
      users: usersData,
      properties: propertiesData
    }
  };
};