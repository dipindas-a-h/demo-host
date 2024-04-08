const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../../helpers");

const { Reseller } = require("../models");
const { readDataFromFile } = require("../../controllers/initial/SaveDataFile");

const b2bResellerAuth = async (req, res, next) => {
    try {
        const data = readDataFromFile()
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return sendErrorResponse(res, 401, "token not found");
        }

        // const decode = jwt.verify(token, process.env.JWT_SECRET);
        const decode = jwt.verify(token, data?.JWT_SECRET);

        const reseller = await Reseller.findOne({
            _id: decode._id,
            jwtToken: token,
        })
            .populate("configuration")
            .populate("country")
            .lean();

        if (!reseller) {
            return sendErrorResponse(res, 401, "invalid token");
        }

        if (reseller.role !== "reseller") {
            return sendErrorResponse(res, 400, "access denied. you should login as a reseller");
        }

        req.reseller = reseller;
        next();
    } catch (err) {
        sendErrorResponse(res, 401, err);
    }
};

module.exports = b2bResellerAuth;
