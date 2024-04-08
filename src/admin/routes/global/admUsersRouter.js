const router = require("express").Router();

const {
    getAllUsers,
    getSingleUserDetails,
} = require("../../controllers/global/admUsersController");

router.get("/all", getAllUsers);
router.get("/single/:userId/details", getSingleUserDetails);

module.exports = router;
