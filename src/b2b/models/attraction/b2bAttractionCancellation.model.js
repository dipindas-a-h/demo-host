const { Schema, model } = require('mongoose')

const b2bAttractionCancellationSchema = new Schema(
    {
        reseller: {
            type: Schema.Types.ObjectId,
            ref: "Reseller",
            required: true
        },
        amount: {
            type: Number,
            required:true
        },
        order: {
            type: Schema.Types.ObjectId,
            required: true
        },
        orderItem: {
           type: Schema.Types.ObjectId,
           required: true
        },
        // dateTime: {
        //     type: Date,
        //     required: true
        // },
        cancellationReason: {
            type: String
        },
        paymentProcessor:{
            type: String,
            required: true,
            lowercase: true,
            enum: ['wallet', "ccavenue"]
        },
        status: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["pending", "cancelled"]
        }
    },
    {timestamps: true}
)

const B2BAttractionOrderCancellation = model("B2BAttractionCancellation", b2bAttractionCancellationSchema)
module.exports = B2BAttractionOrderCancellation