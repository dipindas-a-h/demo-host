const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const {
    addNewVehicleModel,
    deleteVehicleModel,
    getAllVehicleModels,
    updateVehicleModel,
    getSingleVehicleModelTrims,
} = require("../../controllers/transfer/admVehicleModelsController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/transfer");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".")[1]);
    },
});

const upload = multer({
    limits: {
        fileSize: 2000000,
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
});

router.post("/add", upload.single("vehicleImage"), addNewVehicleModel);
router.patch("/update/:id", upload.single("vehicleImage"), updateVehicleModel);
router.delete("/delete/:id", deleteVehicleModel);
router.get("/all", getAllVehicleModels);
router.get("/single/:id/trims", getSingleVehicleModelTrims);

module.exports = router;
