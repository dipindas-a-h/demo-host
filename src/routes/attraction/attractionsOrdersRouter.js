const router = require("express").Router();

const {
    createAttractionOrder,
    capturePaypalAttractionPayment,
    getSingleAttractionOrder,
    captureCCAvenueAttractionPayment,
    captureRazorpayAttractionPayment,
    cancelAttractionOrder,
    refundRequest,
    getSingleUserAllOrders,
    getAttractionOrderTickets,
    getAttractionOrderSingleTickets,
    downloadAttractionOrderInvoice,
    captureTabbyAttractionPayment,
} = require("../../controllers/attraction/attractionsOrdersController");
const { userAuthOrNot, userAuth } = require("../../middlewares");

router.post("/create", userAuthOrNot, createAttractionOrder);
router.post("/paypal/capture", capturePaypalAttractionPayment);
router.post("/ccavenue/capture", captureCCAvenueAttractionPayment);
router.post("/razorpay/capture", captureRazorpayAttractionPayment);
router.post("/tabby/capture", captureTabbyAttractionPayment);
router.post("/cancel", userAuth, cancelAttractionOrder);
router.post("/cancel", userAuth, cancelAttractionOrder);
router.get("/single/:id", getSingleAttractionOrder);
router.get("/all", userAuth, getSingleUserAllOrders);
router.get("/:orderId/ticket/:activityId", getAttractionOrderTickets);
router.get("/:orderId/ticket/:activityId/single/:ticketNo", getAttractionOrderSingleTickets);
router.post("/:orderId/refund/:orderItemId", userAuth, refundRequest);
router.get("/invoice/:orderId", downloadAttractionOrderInvoice);

module.exports = router;
