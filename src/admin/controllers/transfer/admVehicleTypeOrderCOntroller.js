const { isValidObjectId } = require("mongoose");

const { VehicleType, VehicleCategory } = require("../../../models/transfer");
const { vehicleTypeSchema } = require("../../validations/transfer/vehicleType.schema");
const { sendErrorResponse } = require("../../../helpers");
const { B2BTransferOrder } = require("../../../b2b/models");

module.exports = {
    getAllTransferOrders: async (req, res) => {
        try {
            const { skip = 0, limit = 10, search, dateFrom, dateTo } = req.query;

            let filter = {};
            if (search && search !== "") {
                filter.$or = [{ referenceNumber: { $regex: search, $options: "i" } }];
            }

            if (dateFrom && dateFrom !== "" && dateTo && dateTo !== "") {
                filter.$and = [
                    { createdAt: { $gte: new Date(dateFrom) } },
                    { createdAt: { $lte: new Date(dateTo) } },
                ];
            } else if (dateFrom && dateFrom !== "") {
                filter["createdAt"] = {
                    $gte: new Date(dateFrom),
                };
            } else if (dateTo && dateTo !== "") {
                filter["createdAt"] = { $lte: new Date(dateTo) };
            }

            console.log(filter);

            const transferOrders = await B2BTransferOrder.find(filter)
                .populate("reseller country")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalTransfers = await B2BTransferOrder.find(filter).count();

            res.status(200).json({
                transferOrders,
                totalTransfers,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
