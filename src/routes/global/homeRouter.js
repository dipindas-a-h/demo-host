const router = require("express").Router();

const {
    getHomeData,
    getInitialData,
    getContactDetails,
    contactUsMessage,
} = require("../../controllers/global/homeControllers");

router.get("/", getHomeData);
router.get("/initial-data", getInitialData);
router.get("/contact-details", getContactDetails);
router.post("/contact-us", contactUsMessage);

module.exports = router;
