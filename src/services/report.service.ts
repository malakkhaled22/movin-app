import Report from "../models/report.model";

interface GetReportsOptions {
    page: number;
    limit: number;
    status?: string;
}

export const getReportsWithPagination = async ({
    page,
    limit,
    status,
}: GetReportsOptions) => {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
        Report.find(filter)
            .populate("reportedBy", "username email")
            .populate("reportedUser", "username email")
            .populate("reportedProperty", "type location")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Report.countDocuments(filter),
    ]);

    return {
        reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
