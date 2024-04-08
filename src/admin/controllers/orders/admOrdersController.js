const { isValidObjectId, Types } = require("mongoose");
const xl = require("excel4node");
const moment = require("moment");
const {
    B2BOrder,
    B2BAttractionOrder,
    B2BTransferOrder,
    B2BOrderPayment,
} = require("../../../b2b/models");
const { formatDate } = require("../../../utils");
const { sendErrorResponse } = require("../../../helpers");
const {
    B2BAttractionOrderPayment,
    B2BAttractionOrderRefund,
} = require("../../../b2b/models/attraction");
const {
    B2COrder,
    AttractionOrder,
    B2CTransferOrder,
    B2COrderPayment,
    B2CAttractionOrderRefund,
} = require("../../../models");

module.exports = {
    getAllOrders: async (req, res) => {
        try {
            const {
                referenceNo,
                agentCode,
                orderDateFrom,
                orderDateTo,
                orderStatus,
                traveller,
                skip = 0,
                limit = 10,
            } = req.query;

            const filters1 = {};
            const filters2 = {};

            if (referenceNo) {
                filters1["referenceNumber"] = referenceNo;
            }

            if (orderStatus) {
                filters1["orderStatus"] = orderStatus;
            }

            if (traveller) {
                filters1.$or = [
                    { email: { $regex: traveller, $options: "i" } },
                    { name: { $regex: traveller, $options: "i" } },
                ];
            }

            if (orderDateFrom && orderDateTo) {
                filters1.$and = [
                    { createdAt: { $gte: moment(orderDateFrom).startOf("day").toDate() } },
                    { createdAt: { $lte: moment(orderDateTo).startOf("day").toDate() } },
                ];
            } else if (orderDateFrom) {
                filters1["createdAt"] = {
                    $gte: moment(orderDateFrom).startOf("day").toDate(),
                };
            } else if (orderDateTo) {
                filters1["createdAt"] = { $lte: moment(orderDateTo).startOf("day").toDate() };
            }

            if (agentCode && agentCode !== "") {
                filters2["reseller.agentCode"] = Number(agentCode);
            }

            const orders = await B2BOrder.aggregate([
                { $match: filters1 },
                {
                    $lookup: {
                        from: "resellers",
                        localField: "reseller",
                        foreignField: "_id",
                        as: "reseller",
                        pipeline: [{ $project: { companyName: 1, agentCode: 1 } }],
                    },
                },
                { $match: filters2 },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: "countries",
                        localField: "country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                {
                    $set: {
                        country: { $arrayElemAt: ["$country", 0] },
                        reseller: { $arrayElemAt: ["$reseller", 0] },
                    },
                },
                {
                    $project: {
                        referenceNumber: 1,
                        agentReferenceNumber: 1,
                        orderStatus: 1,
                        paymentState: 1,
                        name: 1,
                        email: 1,
                        country: 1,
                        phoneNumber: 1,
                        createdAt: 1,
                        reseller: 1,
                        netPrice: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        data: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        totalOrders: 1,
                        data: {
                            $slice: ["$data", Number(limit) * Number(skip), Number(limit)],
                        },
                    },
                },
            ]);

            res.status(200).json({
                totalOrders: orders[0]?.totalOrders || 0,
                skip: Number(skip),
                limit: Number(limit),
                orders: orders[0]?.data || [],
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleB2bOrder: async (req, res) => {
        try {
            const { orderId } = req.params;

            if (!isValidObjectId(orderId)) {
                return sendErrorResponse(res, 400, "Invalid transfer id");
            }

            const b2bOrder = await B2BOrder.findById(orderId).populate("reseller").lean();

            if (!b2bOrder) {
                return sendErrorResponse(res, 400, "No  order found ");
            }

            if (b2bOrder?.isAttraction) {
                const attractionOrder = await B2BAttractionOrder.findById(b2bOrder?.attractionId)
                    .populate("reseller", "name companyName agentCode email")
                    .populate("country", "phonecode")
                    .populate("activities.activity", "name")
                    .populate("activities.attraction", "title images")
                    .lean();

                const payments = await B2BAttractionOrderPayment.find({ orderId })
                    .sort({ createdAt: -1 })
                    .lean();
                const cancellations = [];
                // await B2BHotelOrderCancellation.find({ orderId })
                // .populate("adminId", "name")
                // .sort({ createdAt: -1 })
                // .lean();
                const refunds = await B2BAttractionOrderRefund.find({ orderId })
                    .sort({ createdAt: -1 })
                    .lean();

                b2bOrder.attractionOrder = attractionOrder;
            }

            if (b2bOrder?.isTransfer) {
                const transferOrder = await B2BTransferOrder.findById(b2bOrder.transferId)
                    .populate("journey.trips.vehicleTypes.vehicleId")
                    .exec();
                // .lean();

                b2bOrder.transferOrder = transferOrder;
            }

            const payments = await B2BOrderPayment.find({ orderId }).sort({ createdAt: -1 }).lean();
            const cancellations = [];
            // await B2BHotelOrderCancellation.find({ orderId })
            // .populate("adminId", "name")
            // .sort({ createdAt: -1 })
            // .lean();
            const refunds = [];

            res.status(200).json({ order: b2bOrder, refunds, payments, cancellations });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    getAllB2cOrders: async (req, res) => {
        try {
            const {
                referenceNo,
                agentCode,
                orderDateFrom,
                orderDateTo,
                orderStatus,
                traveller,
                skip = 0,
                limit = 10,
            } = req.query;

            const filters1 = {};
            const filters2 = {};

            if (referenceNo) {
                filters1["referenceNumber"] = referenceNo;
            }

            if (orderStatus) {
                filters1["orderStatus"] = orderStatus;
            }

            if (traveller) {
                filters1.$or = [
                    { email: { $regex: traveller, $options: "i" } },
                    { name: { $regex: traveller, $options: "i" } },
                ];
            }

            if (orderDateFrom && orderDateTo) {
                filters1.$and = [
                    { createdAt: { $gte: moment(orderDateFrom).startOf("day").toDate() } },
                    { createdAt: { $lte: moment(orderDateTo).startOf("day").toDate() } },
                ];
            } else if (orderDateFrom) {
                filters1["createdAt"] = {
                    $gte: moment(orderDateFrom).startOf("day").toDate(),
                };
            } else if (orderDateTo) {
                filters1["createdAt"] = { $lte: moment(orderDateTo).startOf("day").toDate() };
            }

            if (agentCode && agentCode !== "") {
                filters2["reseller.agentCode"] = Number(agentCode);
            }

            const orders = await B2COrder.aggregate([
                { $match: filters1 },
                {
                    $lookup: {
                        from: "resellers",
                        localField: "reseller",
                        foreignField: "_id",
                        as: "reseller",
                        pipeline: [{ $project: { companyName: 1, agentCode: 1 } }],
                    },
                },
                { $match: filters2 },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: "countries",
                        localField: "country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                {
                    $set: {
                        country: { $arrayElemAt: ["$country", 0] },
                        reseller: { $arrayElemAt: ["$reseller", 0] },
                    },
                },
                {
                    $project: {
                        referenceNumber: 1,
                        agentReferenceNumber: 1,
                        orderStatus: 1,
                        paymentState: 1,
                        name: 1,
                        email: 1,
                        country: 1,
                        phoneNumber: 1,
                        createdAt: 1,
                        reseller: 1,
                        netPrice: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        data: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        totalOrders: 1,
                        data: {
                            $slice: ["$data", Number(limit) * Number(skip), Number(limit)],
                        },
                    },
                },
            ]);

            res.status(200).json({
                totalOrders: orders[0]?.totalOrders || 0,
                skip: Number(skip),
                limit: Number(limit),
                orders: orders[0]?.data || [],
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleB2cOrder: async (req, res) => {
        try {
            const { orderId } = req.params;

            if (!isValidObjectId(orderId)) {
                return sendErrorResponse(res, 400, "Invalid transfer id");
            }

            const b2cOrder = await B2COrder.findById(orderId).populate("user").lean();

            if (!b2cOrder) {
                return sendErrorResponse(res, 400, "No  order found ");
            }

            if (b2cOrder?.isAttraction) {
                const attractionOrder = await AttractionOrder.findById(b2cOrder?.attractionId)
                    .populate("user", "name companyName agentCode email")
                    .populate("country", "phonecode")
                    .populate("activities.activity", "name")
                    .populate("activities.attraction", "title images")
                    .lean();

                // const payments = await B2CAttractionOrderPayment.find({ orderId })
                //     .sort({ createdAt: -1 })
                //     .lean();

                const payments = [];
                const cancellations = [];
                // await B2BHotelOrderCancellation.find({ orderId })
                // .populate("adminId", "name")
                // .sort({ createdAt: -1 })
                // .lean();
                const refunds = await B2CAttractionOrderRefund.find({ orderId })
                    .sort({ createdAt: -1 })
                    .lean();

                b2cOrder.attractionOrder = attractionOrder;
            }

            if (b2cOrder?.isTransfer) {
                const transferOrder = await B2CTransferOrder.findById(b2cOrder.transferId)
                    .populate("journey.trips.vehicleTypes.vehicleId")
                    .exec();
                // .lean();

                b2cOrder.transferOrder = transferOrder;
            }

            const payments = await B2COrderPayment.find({ orderId }).sort({ createdAt: -1 }).lean();
            const cancellations = [];
            // await B2BHotelOrderCancellation.find({ orderId })
            // .populate("adminId", "name")
            // .sort({ createdAt: -1 })
            // .lean();
            const refunds = [];

            res.status(200).json({ order: b2cOrder, refunds, payments, cancellations });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
