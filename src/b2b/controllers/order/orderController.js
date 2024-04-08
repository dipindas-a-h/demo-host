const { sendErrorResponse, sendMobileOtp } = require("../../../helpers");
const { Transfer } = require("../../../models/transfer");
const { b2bTransferOrderSchema } = require("../../validations/transfer/b2bTransfer.schema");
const { State, City, Area } = require("../../../models/global");
const {
    Attraction,
    Airport,
    GroupArea,
    HomeSettings,
    Country,
    B2bHomeSettings,
} = require("../../../models");
const { saveCustomCache, getSavedCache } = require("../../../config/cache");
const {
    B2BTransferOrder,
    B2BWallet,
    B2BTransaction,
    B2BTransferOrderPayment,
    B2BOrder,
    B2BOrderPayment,
    B2BAttractionOrder,
} = require("../../models");
const { generateUniqueString, ccavenueFormHandler } = require("../../../utils");
const { checkWalletBalance, deductAmountFromWallet } = require("../../utils/wallet");
const sendInsufficentBalanceMail = require("../../helpers/sendInsufficentBalanceEmail");
const sendWalletDeductMail = require("../../helpers/sendWalletDeductMail");
const { Hotel } = require("../../../models/hotel");
const { isValidObjectId, Types } = require("mongoose");
const nodeCCAvenue = require("node-ccavenue");
const createB2bTransferOrderInvoice = require("../../helpers/transfer/createTransferOrderInvoice");
const { b2bOrderSchema } = require("../../validations/order/b2bOrder.schema");
const {
    createB2bAttractionOrder,
    createB2bTransferOrder,
    geneB2bOrdersSheet,
} = require("../../helpers/order/b2bCreateOrderHelper");
const {
    attractionOrderCompleteHelper,
} = require("../../helpers/attraction/b2bAttractionOrderHelper");
const b2bOrderInvoice = require("../../helpers/order/b2bOrderInvoice");
const { B2BAttractionOrderPayment } = require("../../models/attraction");
const { transferOrderCompleteHelper } = require("../../helpers/transfer/b2bTransferOrderHelper");
const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");
const data  = readDataFromFile()
const ccav = new nodeCCAvenue.Configure({
    merchant_id: data?.CCAVENUE_MERCHANT_ID,
    working_key: data?.CCAVENUE_WORKING_KEY,
});

module.exports = {
    createB2bOrder: async (req, res) => {
        try {
            const {
                countryCode,
                country,
                name,
                email,
                phoneNumber,
                selectedJourneys,
                selectedActivities,
                paymentMethod,
                agentReferenceNumber,
            } = req.body;

            const { error } = b2bOrderSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            if (!isValidObjectId(country)) {
                return sendErrorResponse(res, 400, "invalid country id");
            }
            const countryDetail = await Country.findOne({
                isocode: countryCode?.toUpperCase(),
                isDeleted: false,
            });
            if (!countryDetail) {
                return sendErrorResponse(res, 400, "country not found");
            }

            const exOrder = await B2BOrder.findOne({
                agentReferenceNumber: agentReferenceNumber?.toLowerCase(),
                reseller: req.reseller?._id,
            });

            if (exOrder) {
                return sendErrorResponse(
                    res,
                    400,
                    "already an order exists with this reference number"
                );
            }
            let netPrice = 0;
            let netProfit = 0;
            let netCost = 0;
            let transferOrderId;
            let attractionOrderId;

            if (selectedJourneys?.length > 0) {
                try {
                    const { orderId, profit, price, cost } = await createB2bTransferOrder({
                        country,
                        name,
                        email,
                        phoneNumber,
                        journeys: selectedJourneys,
                        paymentMethod,
                        req,
                        res,
                    });
                    netPrice += price;
                    netProfit += profit;
                    netCost += cost;
                    transferOrderId = orderId;
                } catch (err) {
                    return sendErrorResponse(res, 500, err);
                }
            }

            if (selectedActivities?.length > 0) {
                try {
                    const { orderId, profit, price, cost } = await createB2bAttractionOrder({
                        countryCode,
                        name,
                        email,
                        country,
                        phoneNumber,
                        agentReferenceNumber,
                        selectedActivities,
                        paymentMethod,
                        req,
                        res,
                    });

                    netPrice += price;
                    netProfit += profit;
                    netCost += cost;
                    attractionOrderId = orderId;
                } catch (err) {
                    return sendErrorResponse(res, 500, err);
                }
            }

            const otp = await sendMobileOtp(countryDetail.phonecode, phoneNumber);

            const b2bOrder = await B2BOrder.create({
                reseller: req?.reseller?._id,
                orderedBy: req?.reseller?.role,
                name: name,
                email: email,
                phoneNumber: phoneNumber,
                country: country,
                otp: otp,
                netPrice: Number(netPrice),
                netProfit: Number(netProfit),
                netCost: Number(netCost),
                isAttraction: attractionOrderId ? true : false,
                isTransfer: transferOrderId ? true : false,
                attractionId: attractionOrderId,
                transferId: transferOrderId,
                orderStatus: "pending",
                paymentState: "non-paid",
                agentReferenceNumber,
                referenceNumber: generateUniqueString("B2B"),
            });

            if (paymentMethod === "ccavenue") {
                // TODO:
                // create a better solution to handle allocations
                // in this approch there is a chance to book single allocation twice or more.

                const transferOrderPayment = await B2BOrderPayment.create({
                    amount: netPrice,
                    orderId: b2bOrder?._id,
                    paymentState: "pending",
                    resellerId: req.reseller?._id,
                    paymentMethod: "ccavenue",
                    paymentStateMessage: "",
                });
                return ccavenueFormHandler({
                    res,
                    totalAmount: netPrice,
                    redirectUrl: `${data?.SERVER_URL}/api/v1/b2b/orders/ccavenue/capture`,
                    cancelUrl: `${data?.SERVER_URL}/api/v1/b2b/orders/ccavenue/capture`,
                    orderId: transferOrderPayment?._id,
                });
            }

            res.status(200).json({
                message: "order has been created",
                orderId: b2bOrder?._id,
                payableAmount: b2bOrder?.netPrice,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    completeB2bOrder: async (req, res) => {
        try {
            const { otp, orderId } = req.body;

            if (!isValidObjectId(orderId)) {
                return sendErrorResponse(res, 400, "Invalid order id");
            }

            const b2bOrder = await B2BOrder.findOne({
                _id: orderId,
                reseller: req.reseller._id,
            });

            if (!b2bOrder) {
                return sendErrorResponse(res, 400, "order not found");
            }

            if (b2bOrder?.status === "completed") {
                return sendErrorResponse(res, 400, "sorry, you have already completed this order!");
            }

            if (!b2bOrder?.otp || b2bOrder?.otp !== Number(otp)) {
                return sendErrorResponse(res, 400, "incorrect otp!");
            }

            let totalAmount = b2bOrder.netPrice;

            let wallet = await B2BWallet.findOne({
                reseller: req.reseller?._id,
            });

            const balanceAvailable = checkWalletBalance(wallet, totalAmount);
            if (!balanceAvailable) {
                let reseller = req.reseller;
                sendInsufficentBalanceMail(reseller);
                return sendErrorResponse(
                    res,
                    400,
                    "insufficient balance. please reacharge and try again"
                );
            }

            const orderPayment = await B2BOrderPayment.create({
                amount: totalAmount,
                orderId: b2bOrder?._id,
                paymentState: "pending",
                resellerId: req.reseller?._id,
                paymentMethod: "ccavenue",
                paymentStateMessage: "",
            });

            let transferOrderPayment;
            let attractionPayment;
            let attractionOrder;
            let transferOrder;

            if (b2bOrder.attractionId) {
                attractionOrder = await B2BAttractionOrder.findOne({
                    _id: b2bOrder.attractionId,
                    reseller: req.reseller._id,
                }).populate({
                    path: "activities.activity",
                    populate: {
                        path: "attraction",
                        populate: {
                            path: "destination",
                        },
                    },
                });

                if (!attractionOrder) {
                    return sendErrorResponse(res, 400, "attraction order not found");
                }

                if (
                    attractionOrder.orderStatus === "completed" ||
                    attractionOrder.paymentState === "fully-paid"
                ) {
                    return sendErrorResponse(
                        res,
                        400,
                        "sorry, you have already completed this order!"
                    );
                }

                try {
                    await attractionOrderCompleteHelper({ attractionOrder });
                } catch (err) {
                    return sendErrorResponse(res, 400, err);
                }

                attractionPayment = await B2BAttractionOrderPayment({
                    amount: attractionOrder.totalAmount,
                    orderId: attractionOrder?._id,
                    paymentState: "pending",
                    paymentStateMessage: "",
                    paymentMethod: "wallet",
                    resellerId: req.reseller?._id,
                });
                await attractionPayment.save();

                attractionOrder.otp = "";
                attractionOrder.orderStatus = "completed";
                attractionOrder.paymentState = "fully-paid";
            }

            if (b2bOrder?.transferId) {
                transferOrder = await B2BTransferOrder.findOne({
                    _id: b2bOrder.transferId,
                    reseller: req.reseller._id,
                });

                if (!transferOrder) {
                    return sendErrorResponse(res, 400, "transfer order not found");
                }

                try {
                    await transferOrderCompleteHelper({ transferOrder });
                } catch (err) {
                    return sendErrorResponse(res, 400, err);
                }

                transferOrderPayment = await B2BTransferOrderPayment.create({
                    amount: transferOrder?.totalNetFare,
                    orderId: transferOrder?._id,
                    paymentState: "pending",
                    resellerId: req.reseller?._id,
                    paymentMethod: "wallet",
                    paymentStateMessage: "",
                });
                transferOrder.paymentState = "fully-paid";
                transferOrder.status = "completed";
            }

            try {
                await deductAmountFromWallet(wallet, totalAmount);
            } catch (err) {
                orderPayment.paymentState = "failed";
                await orderPayment.save();

                return sendErrorResponse(res, 400, "wallet deduction failed, please try again");
            }

            if (b2bOrder.attractionId) {
                await attractionOrder.save();
                attractionPayment.paymentState = "success";
                await attractionPayment.save();
            }

            if (b2bOrder.transferId) {
                await transferOrder.save();
                transferOrderPayment.paymentState = "success";
                await transferOrderPayment.save();
            }

            orderPayment.paymentState = "success";
            await orderPayment.save();

            await B2BTransaction.create({
                reseller: req.reseller?._id,
                paymentProcessor: "wallet",
                product: "all",
                processId: orderId,
                description: `Multiple booking payment`,
                debitAmount: totalAmount,
                creditAmount: 0,
                directAmount: 0,
                closingBalance: wallet.balance,
                dueAmount: wallet.creditUsed,
                remark: "Multiple booking payment",
                dateTime: new Date(),
            });

            console.log("call reached 3");
            let reseller = req.reseller;
            const companyDetails = await B2bHomeSettings.findOne();
            sendWalletDeductMail(reseller, b2bOrder, companyDetails);

            b2bOrder.paymentState = "fully-paid";
            b2bOrder.orderStatus = "completed";
            await b2bOrder.save();
            console.log("call reached 5");

            res.status(200).json({
                message: "order successfully placed",
                referenceNumber: b2bOrder.referenceNumber,
                _id: b2bOrder?._id,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    completeOrderWithCcAvenue: async (req, res) => {
        try {
            const { encResp } = req.body;

            const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);
            const { order_id, order_status } = decryptedJsonResponse;

            const orderPayment = await B2BOrderPayment.findById(order_id);
            if (!orderPayment) {
                return sendErrorResponse(
                    res,
                    400,
                    "order payment not found!. Please check with our team if amount is debited from your bank!"
                );
            }

            const b2bOrder = await B2BOrder.findOne({
                _id: orderPayment?.orderId,
            });
            if (!b2bOrder) {
                return sendErrorResponse(res, 400, "order  not found!");
            }

            if (b2bOrder?.status === "completed") {
                return sendErrorResponse(res, 400, "sorry, you have already completed this order!");
            }

            // if (new Date(b2bHotelOrder.expiresIn).getTime() < new Date().getTime()) {
            //     return sendErrorResponse(
            //         res,
            //         400,
            //         "your order is expired, please create a new order. Please check with our team if amount is debited from your bank!"
            //     );
            // }

            let wallet = await B2BWallet.findOne({ reseller: b2bOrder?.reseller });
            if (!wallet) {
                wallet = await B2BWallet.create({
                    balance: 0,
                    creditAmount: 0,
                    creditUsed: 0,
                    reseller: b2bOrder?.reseller,
                });
            }

            let transferOrderPayment;
            let attractionPayment;
            let attractionOrder;
            let transferOrder;

            if (order_status !== "Success") {
                orderPayment.status = "failed";
                await orderPayment.save();

                res.writeHead(301, {
                    Location: `${data?.B2B_WEB_URL}/payment-decline`,
                });
                res.end();
            } else {
                if (b2bOrder.attractionId) {
                    attractionOrder = await B2BAttractionOrder.findOne({
                        _id: b2bOrder.attractionId,
                        reseller: b2bOrder.reseller,
                    }).populate({
                        path: "activities.activity",
                        populate: {
                            path: "attraction",
                            populate: {
                                path: "destination",
                            },
                        },
                    });

                    if (!attractionOrder) {
                        return sendErrorResponse(res, 400, "attraction order not found");
                    }

                    if (
                        attractionOrder.orderStatus === "completed" ||
                        attractionOrder.paymentState === "fully-paid"
                    ) {
                        return sendErrorResponse(
                            res,
                            400,
                            "sorry, you have already completed this order!"
                        );
                    }

                    try {
                        await attractionOrderCompleteHelper({ attractionOrder });
                    } catch (err) {
                        return sendErrorResponse(res, 400, err);
                    }

                    attractionPayment = await B2BAttractionOrderPayment({
                        amount: attractionOrder.totalAmount,
                        orderId: attractionOrder?._id,
                        paymentState: "pending",
                        paymentStateMessage: "",
                        paymentMethod: "ccavenue",
                        resellerId: b2bOrder.reseller,
                    });
                    await attractionPayment.save();

                    attractionOrder.otp = "";
                    attractionOrder.orderStatus = "completed";
                    attractionOrder.paymentState = "fully-paid";
                    await attractionOrder.save();
                }

                if (b2bOrder?.transferId) {
                    transferOrder = await B2BTransferOrder.findOne({
                        _id: b2bOrder.transferId,
                        reseller: b2bOrder?.reseller,
                    });

                    if (!transferOrder) {
                        return sendErrorResponse(res, 400, "transfer order not found");
                    }

                    try {
                        transferOrder = await transferOrderCompleteHelper({ transferOrder });
                    } catch (err) {
                        return sendErrorResponse(res, 400, err);
                    }

                    transferOrderPayment = await B2BTransferOrderPayment.create({
                        amount: transferOrder?.totalNetFare,
                        orderId: transferOrder?._id,
                        paymentState: "pending",
                        resellerId: b2bOrder.reseller,
                        paymentMethod: "ccavenue",
                        paymentStateMessage: "",
                    });
                    transferOrder.paymentState = "fully-paid";
                    transferOrder.status = "completed";
                    await transferOrder.save();
                }

                if (b2bOrder?.attractionId) {
                    await attractionOrder.save();
                    attractionPayment.paymentState = "success";
                    await attractionPayment.save();
                }

                if (b2bOrder?.transferId) {
                    await transferOrder.save();
                    transferOrderPayment.paymentState = "success";
                    await transferOrderPayment.save();
                }
                orderPayment.status = "success";
                await orderPayment.save();

                await B2BTransaction.create({
                    reseller: b2bOrder?.reseller,
                    paymentProcessor: "ccavenue",
                    product: "all",
                    processId: b2bOrder?._id,
                    description: `All order payment`,
                    debitAmount: 0,
                    creditAmount: 0,
                    directAmount: b2bOrder?.netPrice,
                    closingBalance: wallet.balance,
                    dueAmount: wallet.creditUsed,
                    remark: "All order payment",
                    dateTime: new Date(),
                });

                b2bOrder.paymentState = "fully-paid";
                b2bOrder.orderStatus = "completed";
                await b2bOrder.save();

                res.writeHead(301, {
                    Location: `${data?.B2B_WEB_URL}/order/invoice/${b2bOrder?._id}`,
                });
                res.end();
            }
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { skip = 0, limit = 10, search, dateFrom, dateTo } = req.query;

            const filter = { reseller: req.reseller._id };

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

            const transferOrders = await B2BOrder.find(filter)
                .populate("transferId attractionId")
                .populate("transferId.trips.vehicleType")
                .select({
                    baseFare: 0,
                    profit: 0,
                })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalTransfers = await B2BOrder.find(filter).count();

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

    getSingleOrder: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid transfer id");
            }
            const b2bOrder = await B2BOrder.findById(id)
                .populate("reseller")
                .select({
                    baseFare: 0,
                    profit: 0,
                })
                .lean();

            console.log(b2bOrder, "b2border");
            if (!b2bOrder) {
                return sendErrorResponse(res, 400, "No  order found ");
            }

            if (b2bOrder?.isAttraction) {
                const attOrder = await B2BAttractionOrder.findById(b2bOrder.attractionId)
                    .populate({
                        path: "activities.activity",
                        select: "name attraction",
                        populate: {
                            path: "attraction",
                            select: "title images destination",
                            populate: {
                                path: "destination",
                                select: "name",
                            },
                        },
                    })
                    .select(
                        "activities._id activities.grandTotal activities.activity activities.date activities.adultsCount activities.childrenCount activities.infantCount activities.childTickets activities.adultTickets activities.infantTickets activities.transferType  activities.status  totalAmount orderStatus paymentState"
                    )
                    .exec();

                b2bOrder.attractionOrder = attOrder;
            }

            if (b2bOrder?.isTransfer) {
                const transferOrder = await B2BTransferOrder.findById(b2bOrder.transferId)
                    .populate("journey.trips.vehicleTypes.vehicleId")
                    .select(
                        "journey.transferType journey.noOfAdults journey.noOfChildrens journey.trips journey.netPrice netFare paymentState"
                    )

                    .exec();
                // .lean();

                b2bOrder.transferOrder = transferOrder;
            }

            res.status(200).json(b2bOrder);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    downloadOrderInvoice: async (req, res) => {
        try {
            const { orderId } = req.params;

            if (!isValidObjectId(orderId)) {
                return sendErrorResponse(res, 400, "invalid hotel order id");
            }

            const b2bOrder = await B2BOrder.findOne({
                _id: orderId,
                // reseller: req.reseller?._id,
            })
                .select("_id status")
                .lean();
            if (!b2bOrder) {
                return sendErrorResponse(res, 404, "transfer order not found");
            }

            if (b2bOrder.status === "pending") {
                return sendErrorResponse(res, 400, "sorry, transfer order not completed");
            }

            const pdfBuffer = await b2bOrderInvoice({
                orderId,
                resellerId: req.reseller?._id,
            });

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=invoice.pdf",
            });
            res.send(pdfBuffer);
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleB2bAllOrdersSheet: async (req, res) => {
        try {
            await geneB2bOrdersSheet({
                ...req.query,
                res,
                resellerId: req.reseller?._id,
                orderedBy: "",
                agentCode: "",
                downloader: req.reseller?.role,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
