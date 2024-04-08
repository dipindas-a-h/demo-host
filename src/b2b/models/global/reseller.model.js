const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const jwt = require("jsonwebtoken");
const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");

const AutoIncrement = require("mongoose-sequence")(mongoose);

const resellerSchema = new Schema(
    {
        agentCode: {
            type: Number,
        },
        companyName: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        website: {
            type: String,
            required: true,
        },
        country: {
            type: Schema.Types.ObjectId,
            ref: "Country",
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        zipCode: {
            type: Number,
        },
        designation: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        skypeId: {
            type: String,
        },
        whatsappNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        jwtToken: {
            type: String,
        },
        trnNumber: {
            type: String,
        },
        companyRegistration: {
            type: String,
        },
        telephoneNumber: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["pending", "ok", "cancelled", "disabled"],
        },
        role: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["reseller", "sub-agent"],
        },
        referredBy: {
            type: Schema.Types.ObjectId,
            ref: "Reseller",
            required: function () {
                return this.role === "sub-agent";
            },
        },
        // markets: {
        //     type: [
        //         {
        //             type: Schema.Types.ObjectId,
        //             ref: "Market",
        //             required: true,
        //         },
        //     ],
        // },
        otp: {
            type: Number,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        marketStrategy: {
            type: Schema.Types.ObjectId,
            ref: "MarketStrategy",
        },
        companyLogo: {
            type: String,
        },
        shortName: {
            type: String,
        },
        avatarImg: {
            type: String,
        },
    },
    { timestamps: true }
);

resellerSchema.plugin(AutoIncrement, {
    inc_field: "agentCode",
    start_seq: 10000,
});

resellerSchema.virtual("configuration", {
    ref: "ResellerConfiguration",
    localField: "_id",
    foreignField: "reseller",
    justOne: true,
});

resellerSchema.methods.toJSON = function () {
    const reseller = this;
    const resellerObj = reseller.toObject();

    delete resellerObj.password;
    delete resellerObj.jwtToken;

    return resellerObj;
};

resellerSchema.methods.generateAuthToken = async function () {
    try {
        const data = readDataFromFile()
        const reseller = this;
        const jwtToken = jwt.sign(
            {
                _id: reseller._id.toString(),
                email: reseller?.email?.toString(),
            },
            data?.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        reseller.jwtToken = jwtToken;
        return jwtToken;
    } catch (err) {
        throw new Error(err);
    }
};

const Reseller = model("Reseller", resellerSchema);

module.exports = Reseller;
