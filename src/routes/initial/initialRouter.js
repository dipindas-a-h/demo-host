const configRouter = require('express').Router();
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
]);

const {createInitialData,getInitialData,deleteInitialData,clearInitialData,updateInitialData,getCompanyData} = require('../../controllers/initial/initialController');
const { adminAuth } = require('../../admin/middlewares');
configRouter.post ('/',upload,createInitialData)

configRouter.use(adminAuth)
configRouter.get ('/',getInitialData)
configRouter.delete ('/:id',deleteInitialData)
configRouter.delete ('/',clearInitialData)
configRouter.patch ('/:id',upload,updateInitialData)
configRouter.get ('/company',getCompanyData)




// configRouter.post ('/',()=> console.log('datas'))


module.exports = configRouter