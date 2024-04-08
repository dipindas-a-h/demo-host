const router = require("express").Router();

const {
    getAllB2cOrders,
    getAllB2cOrdersSheet,
    getAllB2bOrders,
    confirmBooking,
    cancelBooking,
    updateDriverForOrder,
    getSingleResellerAttractionOrders,
    getB2bAllOrdersSheet,
    getSingleResellerAttractionOrdersSheet,
    getAllOrdersStatistics,
    getAllB2bAttractionOrders,
    getSingleB2bAttractionOrder,
    getAllB2cAttractionOrders,
    getSingleB2cAttractionOrder,
    downloadAttractionOrderTickets,
} = require("../../controllers/attraction/admAttractionsOrdersController");

router.get("/b2b/all", getAllB2bAttractionOrders);
router.get("/b2b/single/:orderId", getSingleB2bAttractionOrder);
router.get("/b2c/all", getAllB2cAttractionOrders);
router.get("/b2c/single/:orderId", getSingleB2cAttractionOrder);

router.get("/orderItems/b2c/all", getAllB2cOrders);
router.get("/orderItems/b2c/all/sheet", getAllB2cOrdersSheet);
router.get("/orderItems/b2b/all", getAllB2bOrders);
router.get("/orderItems/b2b/all/sheet", getB2bAllOrdersSheet);
router.get("/:orderId/orderItems/:activityId/tickets", downloadAttractionOrderTickets);

router.get("/b2b/reseller/:resellerId/all", getSingleResellerAttractionOrders);
router.get("/b2b/reseller/:resellerId/all/sheet", getSingleResellerAttractionOrdersSheet);

router.patch("/bookings/confirm", confirmBooking);
router.patch("/bookings/cancel", cancelBooking);
router.patch("/assign-driver", updateDriverForOrder);
router.get("/statistics", getAllOrdersStatistics);

module.exports = router;
