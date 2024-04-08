const router = require("express").Router();

const {
    getAllTransferOrders,
} = require("../../controllers/transfer/admVehicleTypeOrderCOntroller");

router.get("/list/all", getAllTransferOrders);

module.exports = router;
