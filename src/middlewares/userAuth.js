const jwt = require("jsonwebtoken");

const { User } = require("../models");
const { sendErrorResponse } = require("../helpers");
const { readDataFromFile } = require("../controllers/initial/SaveDataFile");

const userAuth = async (req, res, next) => {
    try {
        const data = readDataFromFile()
        const token = req.headers.authorization?.split(" ")[1];
        const decode = jwt.verify(token, data?.JWT_SECRET);
        const user = await User.findOne({
            _id: decode._id,
            jwtToken: token,
        });

        if (!user) {
            return sendErrorResponse(res, 401, "Invalid Token");
        }

        req.user = user;
        next();
    } catch (err) {
        sendErrorResponse(res, 401, err);
    }
};

module.exports = userAuth;
