const { Schema, model } = require("mongoose");

const b2cAttractionOrderRefundSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["wallet"],
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "B2BAttractionOrder",
            required: true,
        },
        note: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["pending", "success", "failed"],
        },
    },
    { timestamps: true }
);

const B2CAttractionOrderRefund = model("B2CAttractionOrderRefund", b2cAttractionOrderRefundSchema);

module.exports = B2CAttractionOrderRefund;
