const router = require("express").Router();

const {
    getAllResellers,
    changeResellerStatus,
    getSingleResellerWithDetails,
    getSingleResellersSubagents,
    updateReseller,
    getSingleReseller,
    addNewReseller,
    getSingleResellerConfigurations,
    updateResellerConfigurations,
    addNewSubAgent,
    getSingleResellerBasicInfo,
    createB2BResellersExcelSheet,
    checkShortNameAvailabilty,
    updateShortNameReseller,
} = require("../../controllers/global/admResellersController");

router.get("/all", getAllResellers);
router.get("/single/:id", getSingleReseller);
router.get("/single/:id/basic-info", getSingleResellerBasicInfo);
router.get("/single/:id/configurations", getSingleResellerConfigurations);
router.get("/single/:id/details", getSingleResellerWithDetails);
router.get("/:resellerId/sub-agents", getSingleResellersSubagents);
router.patch("/update/:resellerId/status", changeResellerStatus);
router.patch("/update/:id", updateReseller);
router.patch("/update/:id/configurations", updateResellerConfigurations);
router.post("/add", addNewReseller);
router.post("/sub-agents/add", addNewSubAgent);
router.get("/all-excelSheet", createB2BResellersExcelSheet);
router.get("/availability/shortName/:id", checkShortNameAvailabilty);
router.patch("/update/shotName/:id", updateShortNameReseller);

module.exports = router;
