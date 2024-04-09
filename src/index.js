const {
    completeProfitDetailWhatsappHelper,
} = require("./admin/helpers/whatsapp/admWhatsappHelper");
const { app } = require("./app");
const { connectRedisDb } = require("./config/cache");
const { connectMonogdb } = require("./config/dbConfig");
const { connectWhatsApp } = require("./config/whatsappConfig");
const { readDataFromFile } = require("./controllers/initial/SaveDataFile");
const CronJob = require("./cron");



const data = readDataFromFile()
const PORT = process.env.PORT || 8189;
const NODE_ENV = data?.NODE_ENV === "production" ? "production" : "development";

const start = async () => {
    try {
        if (data?.REDIS_REQUIRED === "true") {
            await connectRedisDb();
        }
        await connectMonogdb();
        // await connectWhatsApp();
        const cronObj = new CronJob();
        cronObj.deleteHotelSearchResults();
        cronObj.sendHotelPayLaterEmails();
        cronObj.sendAdminWhatsappMessage();
    } catch (err) {
        console.log(err);
    }

    app.listen(PORT, () => {
        console.log(`running ${NODE_ENV} server....`);
        console.log(`server is up and running on port ${PORT}`);
    });
};

start();
