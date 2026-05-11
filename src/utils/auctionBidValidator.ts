type BidInput = {
    amount?: number;
    increment?: number;
    percent?: number;
};

export const validateBidRules = ({
    input,
    finalBidAmount,
    currentBid,
    startPrice,
    }: {
    input: BidInput;
    finalBidAmount: number;
    currentBid: number;
    startPrice: number;
    }) => {
    const base = currentBid || startPrice;

    // ✅ First bid must be >= startPrice
    if (base === startPrice && finalBidAmount < startPrice) {
        return {
        valid: false,
        message: `First bid must be at least ${startPrice}`,
        };
    }

    // ✅ Manual amount must be at least base + 10k
    if (input.amount !== undefined) {
        const MIN_MANUAL_INCREMENT = 10 * 1000;

        if (finalBidAmount < base + MIN_MANUAL_INCREMENT) {
        return {
            valid: false,
            message: `Minimum bid increase is 10,000. Your bid must be at least ${
            base + MIN_MANUAL_INCREMENT
            }`,
        };
        }
    }
    return { valid: true };
};

export const buildBidUpdateCondition = ({
    propertyId,
    finalBidAmount,
    amount,
    }: {
    propertyId: string;
    finalBidAmount: number;
    amount?: number;
    }) => {
    let updateCondition: any = {
        _id: propertyId,
        status: "approved",
        "auction.status": "approved",
        "auction.isAuction": true,
        "auction.endTime": { $gt: new Date() },
        $or: [
        { "auction.currentBid": { $lt: finalBidAmount } },
        {
            "auction.currentBid": { $exists: false },
            "auction.startPrice": { $lt: finalBidAmount },
        },
        ],
    };

    if (amount !== undefined) {
        const MIN_MANUAL_INCREMENT = 10 * 1000;

        updateCondition = {
        _id: propertyId,
        status: "approved",
        "auction.status": "approved",
        "auction.isAuction": true,
        "auction.endTime": { $gt: new Date() },

        $or: [
            {
            "auction.currentBid": { $exists: true, $ne: null },
            $expr: {
                $gte: [
                finalBidAmount,
                { $add: ["$auction.currentBid", MIN_MANUAL_INCREMENT] },
                ],
            },
            },
            {
            $or: [
                { "auction.currentBid": { $exists: false } },
                { "auction.currentBid": null },
                { "auction.currentBid": 0 },
            ],
            $expr: {
                $gte: [
                finalBidAmount,
                { $add: ["$auction.startPrice", MIN_MANUAL_INCREMENT] },
                ],
            },
            },
        ],
        };
    }
    return updateCondition;
};