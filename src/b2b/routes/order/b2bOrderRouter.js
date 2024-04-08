const router = require("express").Router();

const { b2bAuth } = require("../../middlewares");
const {
    createB2bOrder,
    completeB2bOrder,
    completeOrderWithCcAvenue,
    getAllOrders,
    getSingleOrder,
    downloadOrderInvoice,
    getSingleB2bAllOrdersSheet,
} = require("../../controllers/order/orderController");

router.post("/create", b2bAuth, createB2bOrder);
router.post("/complete", b2bAuth, completeB2bOrder);
router.post("/ccavenue/capture", completeOrderWithCcAvenue);

router.get("/list/all", b2bAuth, getAllOrders);
router.get("/single/:id", b2bAuth, getSingleOrder);
router.get("/invoice/:orderId", downloadOrderInvoice);
router.get("/all/sheet", b2bAuth, getSingleB2bAllOrdersSheet);

// router.post("/booking/room-rate", b2bAuth, getSingleRoomRateWithDetails);

module.exports = router;
