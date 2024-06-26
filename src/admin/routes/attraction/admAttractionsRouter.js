const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
    addAttractionReview,
} = require("../../controllers/attraction/admAttractionReviewController");

const {
    createNewAttraction,
    connectApi,
    addAttractionActivity,
    getAllAttractions,
    getInitialData,
    getSingleAttraction,
    updateAttraction,
    deleteAttraction,
    getSingleAttractionReviews,
    getSingleActivity,
    updateActivity,
    deleteActivity,
    getSingleAttractionBasicData,
    deleteAttractionReview,
    updateAttractionIsActiveOrNot,
    getAllAttractionAndActivitiesNames,
    showBalance,
    updateIsActiveActivity,
    updateSlug,
    updateAllActivityProfiles,
    updateAllActivities,
    getAllAttractionDetails,
    updateAttractionSlug,
} = require("../../controllers/attraction/admAttractionsController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/attractions");
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".")[1]);
    },
});

const upload = multer({
    limits: {
        fileSize: 20000000,
    },
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path.extname(file.originalname);
        if (!allowed.includes(ext)) {
            return cb(new Error("Please upload jpg, jpeg, webp, or png"));
        }
        cb(undefined, true);
    },
    storage: storage,
}).fields([
    { name: "images", maxCount: 8 },
    { name: "logo", maxCount: 1 },
]);

const activityUpload = multer({
    limits: {
        fileSize: 20000000,
    },
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path.extname(file.originalname);
        if (!allowed.includes(ext)) {
            return cb(new Error("Please upload jpg, jpeg, webp, or png"));
        }
        cb(undefined, true);
    },
    storage: storage,
}).fields([{ name: "images", maxCount: 8 }]);

router.post("/create", upload, createNewAttraction);
router.post("/activities/add", activityUpload, addAttractionActivity);

router.patch("/update/:id", upload, updateAttraction);
router.post("/connect/api/:id", connectApi);
router.patch("/activities/update/:activityId", activityUpload, updateActivity);
router.patch("/update/:id/is-active", updateAttractionIsActiveOrNot);
router.patch("/update/activities/:activityId/is-active", updateIsActiveActivity);

router.get("/all", getAllAttractions);
router.get("/initial-data", getInitialData);
router.get("/single/:id", getSingleAttraction);
router.get("/activities/names/all", getAllAttractionAndActivitiesNames);
router.get("/activities/:activityId", getSingleActivity);
router.get("/single/:id/basic-data", getSingleAttractionBasicData);
router.get("/balance/:id", showBalance);

router.delete("/delete/:id", deleteAttraction);
router.delete("/activities/delete/:activityId", deleteActivity);
router.get("/update/slug", updateSlug);
router.patch("/activities/profiles/update/:activityId", updateAllActivityProfiles);
router.get("/act", updateAllActivities);

// adde new router attraction suggestions
router.get("/all-suggestions", getAllAttractionDetails);

router.patch("/slug/update/:id", updateAttractionSlug);

module.exports = router;
