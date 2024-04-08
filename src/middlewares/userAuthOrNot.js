const jwt = require("jsonwebtoken");

const { User } = require("../models");
const { sendErrorResponse } = require("../helpers");
const { readDataFromFile } = require("../controllers/initial/SaveDataFile");

const userAuthOrNot = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const data = readDataFromFile()

        if (token) {
            const decode = jwt.verify(token, data?.JWT_SECRET);

            const user = await User.findOne({
                _id: decode._id,
                jwtToken: token,
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (err) {
        sendErrorResponse(res, 401, err);
    }
};

module.exports = userAuthOrNot;
