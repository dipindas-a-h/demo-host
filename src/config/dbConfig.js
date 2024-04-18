const mongoose = require("mongoose");

const mongoUrl = process.env.MONGODB_URL;

const connectMonogdb = async () => {
    try {
        console.log(mongoUrl, "mongoUrl");
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        throw err;
    }
};

module.exports = { connectMonogdb };
