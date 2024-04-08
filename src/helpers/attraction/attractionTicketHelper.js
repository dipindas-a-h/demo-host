const { updateTicketCountCache } = require("../../config/cache");
const { AttractionTicket } = require("../../models");
const { isValidObjectId, Types } = require("mongoose");
const moment = require("moment");

const updateTicketCountHelper = async ({ attraction, activity, date }) => {
    try {
        console.log("call reached here", date, new Date());
        let adultTicketCount = await AttractionTicket.find({
            activity: activity,
            ticketFor: "adult",
            status: "ok",
            $and: [
                {
                    $or: [
                        {
                            validity: true,
                            validTill: {
                                $gte: new Date(date).toISOString(),
                            },
                        },
                        { validity: false },
                    ],
                },
                {
                    $or: [
                        {
                            reservationValidity: { $exists: true },
                            reservationValidity: {
                                $lte: moment().utc().valueOf(),
                            },
                        },
                        { reservationValidity: null },
                        { reservationValidity: { $exists: false } },
                    ],
                },
            ],
        }).count();

        let childTicketCount = await AttractionTicket.find({
            activity: activity,
            ticketFor: "child",
            status: "ok",
            $and: [
                {
                    $or: [
                        {
                            validity: true,
                            validTill: {
                                $gte: new Date(date).toISOString(),
                            },
                        },
                        { validity: false },
                    ],
                },
                {
                    $or: [
                        {
                            reservationValidity: { $exists: true },
                            reservationValidity: {
                                $lte: moment().utc().valueOf(),
                            },
                        },
                        { reservationValidity: null },
                        { reservationValidity: { $exists: false } },
                    ],
                },
            ],
        }).count();

        let infantTicketCount = await AttractionTicket.find({
            activity: activity,
            ticketFor: "infant",
            status: "ok",
            $and: [
                {
                    $or: [
                        {
                            validity: true,
                            validTill: {
                                $gte: new Date(date).toISOString(),
                            },
                        },
                        { validity: false },
                    ],
                },
                {
                    $or: [
                        {
                            reservationValidity: { $exists: true },
                            reservationValidity: {
                                $lte: moment().utc().valueOf(),
                            },
                        },
                        { reservationValidity: null },
                        { reservationValidity: { $exists: false } },
                    ],
                },
            ],
        }).count();

        await updateTicketCountCache({
            attraction: attraction.toString(),
            activity: activity.toString(),
            adultCount: adultTicketCount || 0,
            childCount: childTicketCount || 0,
            infantCount: infantTicketCount || 0,
        });

        console.log(adultTicketCount, childTicketCount, "childTicketCount");

        return {
            adultCount: adultTicketCount || 0,
            childCount: childTicketCount || 0,
            infantCount: infantTicketCount || 0,
        };
    } catch (err) {
        throw err;
    }
};

module.exports = { updateTicketCountHelper };
