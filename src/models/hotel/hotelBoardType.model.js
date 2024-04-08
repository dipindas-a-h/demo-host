const { Schema, model } = require("mongoose");

const hotelBoardTypeSchema = new Schema(
    {
        boardName: {
            type: String,
            required: true,
        },
        boardShortName: {
            type: String,
            required: true,
            uppercase: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const HotelBoardType = model("HotelBoardType", hotelBoardTypeSchema);

module.exports = HotelBoardType;
