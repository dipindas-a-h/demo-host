const {
    completeProfitDetailWhatsappHelper,
} = require("./admin/helpers/whatsapp/admWhatsappHelper");
const { app } = require("./app");
const { connectRedisDb } = require("./config/cache");
const { connectMonogdb } = require("./config/dbConfig");
const { connectWhatsApp } = require("./config/whatsappConfig");
const CronJob = require("./cron");

const PORT = process.env.PORT || 8189;
const NODE_ENV = process.env.NODE_ENV === "production" ? "production" : "development";

const start = async () => {
    try {
        if (process.env.REDIS_REQUIRED === "true") {
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
