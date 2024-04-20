const mongoose = require("mongoose");

// const mongoUrl = process.env.MONGODB_URL;
const mongoUrl = `mongodb://127.0.0.1:27017:27017/saas_db`;
mongoose.set("strictQuery", false);

const connectMonogdb = async () => {
    try {
        console.log(mongoUrl, "mongoUrl");
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err, "database error");
        throw err;
    }
};

module.exports = { connectMonogdb };
