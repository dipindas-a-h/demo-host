const {
    getHomeBannaers,
    getHomeSections,
    getContactDetails,
    getHomeData,
    getInitialData,
} = require("../../controllers/global/b2bHomeController");

const router = require("express").Router();

router.get("/banners", getHomeBannaers);
router.get("/sections", getHomeSections);
router.get("/", getHomeData);
router.get("/initial-data", getInitialData);
router.get("/contact-details", getContactDetails);

module.exports = router;
