const { Schema, model } = require("mongoose");

const b2bAttractionOrderRefundSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        resellerId: {
            type: Schema.Types.ObjectId,
            ref: "Reseller",
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

const B2BAttractionOrderRefund = model("B2BAttractionOrderRefund", b2bAttractionOrderRefundSchema);

module.exports = B2BAttractionOrderRefund;
