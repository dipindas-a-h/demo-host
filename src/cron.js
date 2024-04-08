const cron = require("node-cron");

const { HotelAvailSearchResult } = require("./models/hotel");
const { B2BHotelPayLaterCronJob } = require("./b2b/models/hotel");
const {
    sendHotelPayLaterOrderCancelEmailToAdmin,
    sendHotelPayLaterPaymentAlertEmail,
} = require("./b2b/helpers/hotel/email");
const {
    completeProfitDetailWhatsappHelper,
} = require("./admin/helpers/whatsapp/admWhatsappHelper");

class CronJob {
    deleteHotelSearchResults() {
        // This cron job will run every 3 hours
        cron.schedule("0 */3 * * *", async function () {
            console.log("Executing delete hotel search results Cron Job...", new Date());

            const response = await HotelAvailSearchResult.deleteMany({
                expiresIn: { $lte: new Date(new Date().setMinutes(new Date().getMinutes() - 30)) },
            });

            console.log(`Deleted ${response?.deletedCount} Documents`);
        });
    }

    async sendHotelPayLaterEmails() {
        // This cron job will run every day at 6 AM
        cron.schedule("0 6 * * *", async function () {
            console.log("Executing hotel pay later email Cron Job...", new Date());
            const cronJobs = await B2BHotelPayLaterCronJob.find({
                expiryDatePluOne: { $gte: new Date() },
            }).lean();

            for (let cronJob of cronJobs) {
                const date1 = new Date();
                const date2 = new Date(cronJob?.expiryDate);
                const diffTime = Math.abs(date2 - date1);
                const expireInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (expireInDays === 5 || expireInDays === 2 || expireInDays === 0) {
                    sendHotelPayLaterPaymentAlertEmail({ orderId: cronJob.hotelOrder });
                } else if (expireInDays < 0) {
                    sendHotelPayLaterOrderCancelEmailToAdmin({ orderId: cronJob.hotelOrder });
                }
            }
        });
    }

    async sendAdminWhatsappMessage() {
        cron.schedule("01 00 * * *", async function () {
            completeProfitDetailWhatsappHelper();
        });
    }
}

module.exports = CronJob;
