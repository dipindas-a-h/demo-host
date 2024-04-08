const jwt = require("jsonwebtoken");

const { Admin } = require("../models");
const { sendErrorResponse } = require("../../helpers");
const { readDataFromFile } = require("../../controllers/initial/SaveDataFile");

const adminAuth = async (req, res, next) => {
    try {
        const data = readDataFromFile()
        const token = req.headers.authorization?.split(" ")[1];
        const decode = jwt.verify(token, data?.JWT_SECRET);
        const admin = await Admin.findOne({
            _id: decode._id,
            jwtToken: token,
        }).populate("roles");

        if (!admin) {
            return sendErrorResponse(res, 401, "Invalid Token");
        }

        req.admin = admin;
        next();
    } catch (err) {
        sendErrorResponse(res, 401, err);
    }
};

module.exports = adminAuth;
