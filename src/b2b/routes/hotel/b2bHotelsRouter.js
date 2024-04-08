const router = require("express").Router();

const {
    getB2bHotelHomeData,
    getSuggestedHotels,
} = require("../../controllers/hotel/b2bHotelsControllers");
const { b2bAuth } = require("../../middlewares");

router.get("/home", b2bAuth, getB2bHotelHomeData);
router.get("/suggested-hotels", b2bAuth, getSuggestedHotels);

module.exports = router;
