const { sendErrorResponse } = require("../../../helpers");
const { User, AffiliateClickHistory, AffiliatePointHistory } = require("../../../models");
const { isValidObjectId, Types } = require("mongoose");

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const { limit = 10, skip = 0 } = req.query;

            const users = await User.find({})
                .populate("country")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalUsers = await User.count();

            res.status(200).json({
                users,
                totalUsers,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleUserDetails: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.aggregate([
                {
                    $match: {
                        _id: Types.ObjectId(userId),
                    },
                },
                {
                    $lookup: {
                        from: "countries", // Replace with the actual name of the "country" collection
                        localField: "country", // Replace with the actual field name in the User collection
                        foreignField: "_id", // Replace with the actual field name in the Country collection
                        as: "countryData",
                    },
                },
                {
                    $lookup: {
                        from: "affiliateusers", // Replace with the actual name of the "country" collection
                        localField: "_id", // Replace with the actual field name in the User collection
                        foreignField: "user", // Replace with the actual field name in the Country collection
                        as: "affiliateDetails",
                    },
                },
                {
                    $set: {
                        affiliateDetails: {
                            $arrayElemAt: ["$affiliateDetails", 0],
                        },
                        country: {
                            $arrayElemAt: ["$countryData", 0],
                        },
                    },
                },
            ]);
        

            if (!user[0]) {
                return sendErrorResponse(res, 400, "user not found");
            }

            const totalClicks = await AffiliateClickHistory.aggregate([
                // { $match: { clickType: "attraction" } },
                { $match: { user: Types.ObjectId(userId) } },

                {
                    $group: {
                        _id: null,
                        totalClicks: { $sum: 1 },
                    },
                },
            ]);

            const totalPoints = await AffiliatePointHistory.aggregate([
                // { $match: { status: "success" } },
                { $match: { user: Types.ObjectId(userId) } },

                {
                    $group: {
                        _id: null,
                        totalTransation: { $sum: 1 },
                        totalPoints: { $sum: "$points" },
                    },
                },
            ]);

            res.status(200).json({
                user: user[0],
                totalClicks: totalClicks[0]?.totalClicks || 0,
                totalPoints: totalPoints[0]?.totalPoints || 0,
                totalTransation: totalPoints[0]?.totalTransation || 0,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
