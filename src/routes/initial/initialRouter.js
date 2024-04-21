const configRouter = require("express").Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/initial");
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
    { name: "FAV_IMAGE", maxCount: 1 },
    { name: "COMPANY_LOGO", maxCount: 1 },
    { name: "NEXT_PUBLIC_COMPANY_LOGO", maxCount: 1 },
    { name: "NEXT_PUBLIC_COMPANY_FAVICON", maxCount: 1 },
    { name: "NEXT_PUBLIC_BANNER_IMAGE", maxCount: 1 },
    { name: "NEXT_PUBLIC_BANNER_VIDEO", maxCount: 1 },
    { name: "NEXT_PUBLIC_BANNER_VIDEO_MOBILE", maxCount: 1 },
    { name: "NEXT_PUBLIC_BANNER_IMAGE_MOBILE", maxCount: 1 },
    { name: "NEXT_PUBLIC_MOBILE_APP_IMAGE", maxCount: 1 },
    { name: "B2B_MOBILE_APP_IMAGE", maxCount: 1 },
    { name: "B2B_COMPANY_LOGO", maxCount: 1 },
    { name: "B2B_COMPANY_FAVICON", maxCount: 1 },
    { name: "B2B_LOGIN_BANNER", maxCount: 1 },
    { name: "B2B_SIGNUP_BANNER", maxCount: 1 },
]);

const {
    createInitialData,
    getInitialData,
    deleteInitialData,
    clearInitialData,
    updateInitialData,
    getCompanyData,
    getRequiredData,
    getB2BData,
    testData,
} = require("../../controllers/initial/initialController");
const { adminAuth } = require("../../admin/middlewares");
// configRouter.post("/", createInitialData);
configRouter.post("/", (req, res) => {
    console.log("show ");

    res.status(200).json({ message: "nothing" });
});
configRouter.get("/", getInitialData);
configRouter.delete("/", clearInitialData);
configRouter.get("/b2c", getRequiredData);
configRouter.get("/b2b", getB2BData);
configRouter.post("/test", testData);

configRouter.use(adminAuth);
configRouter.delete("/:id", deleteInitialData);
configRouter.patch("/", upload, updateInitialData);
configRouter.get("/company", getCompanyData);

module.exports = configRouter;
