const { default: axios } = require("axios");

const OTTILA_BASE_URL = process.env.OTTILA_BASE_URL;
const PROXY_SERVER_URL = "https://dev.mytravellerschoice.com/proxy";
const config = {
    headers: {
        UserName: process.env.OTTILA_USERNAME,
        Password: process.env.OTTILA_PASSWORD,
    },
};

const getOttilaHotelsAvailabilityByHCode = async ({
    fromDate,
    toDate,
    rooms,
    nationality,
    noOfNights,
    configuration,
    priceType,
    ottilaHotelCodes,
    hotelsWithOttilaId,
}) => {
    try {
        if (
            1 === 1
            // apiHotelCodes?.length > 0
            // configuration?.showOttilaHotels === true &&
            // priceType !== "static"
        ) {
            console.time("ottila search");

            // TODO:
            // we need ottila's cityId.
            // we need ottila's hotel codes.
            // we need nationality of client.

            let hCodes = ``;
            ottilaHotelCodes?.forEach((item, index) => {
                if (index === 0) hCodes += item;
                else hCodes += `,${item}`;
            });

            const body = {
                CityId: 1,
                NationalityId: "1",
                CheckInDate: fromDate,
                CheckOutDate: toDate,
                HCodes: hCodes,
                RoomDetail: rooms?.map((item, index) => {
                    return {
                        RoomSrNo: index + 1,
                        NoOfAdult: item?.noOfAdults,
                        NoOfChild: item?.noOfChildren,
                        ChildAges: item?.childrenAges,
                    };
                }),
            };

            const response = await axios.post(
                PROXY_SERVER_URL,
                {
                    url: OTTILA_BASE_URL + "/XCon_Service/APIOut/Availability/1/HSearchByHCodes",
                    ...body,
                },
                {
                    headers: config.headers,
                }
            );

            console.log(response.data);

            let ottilaHotels = [];
            if (response.data.Hotels && response.data.Hotels?.length > 0) {
                response.data.Hotels?.forEach((hotelAvailability) => {
                    let minRate = hotelAvailability?.Amount;
                    let minRateOffer = 0;
                    let maxRate = null;

                    ottilaHotels.push({
                        hotel: hotelsWithOttilaId[hotelAvailability?.HCode],
                        rooms: [],
                        minRate,
                        maxRate,
                        totalOffer: minRateOffer,
                        noOfNights,
                    });
                });
            }
            console.timeEnd("hotel bed search");
            return { ottilaHotels };
        }

        return { ottilaHotels: [] };
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const getSingleOttilaHotelAvailability = async ({
    fromDate,
    toDate,
    rooms,
    marketStrategy,
    profileMarkup,
    nationality,
    ottilaHotelCodes,
    hotelsWithOttilaId,
    noOfNights,
    clientMarkups,
    clientStarCategoryMarkups,
    subAgentMarkups,
    subAgentStarCategoryMarkups,
    reseller,
    configuration,
    priceType,
}) => {
    try {
        if (
            // apiHotelCodes?.length > 0 &&
            // configuration?.showHotelBedHotels === true &&
            // priceType !== "static"
            1 === 1
        ) {
            console.time("hotel bed search");

            let hCodes = ``;
            ottilaHotelCodes?.forEach((item, index) => {
                if (index === 0) hCodes += item;
                else hCodes += `,${item}`;
            });

            const body = {
                CityId: 1,
                NationalityId: "1",
                CheckInDate: fromDate,
                CheckOutDate: toDate,
                HCode: hCodes,
                RoomDetail: rooms?.map((item, index) => {
                    return {
                        RoomSrNo: index + 1,
                        NoOfAdult: item?.noOfAdults,
                        NoOfChild: item?.noOfChildren,
                        ChildAges: item?.childrenAges,
                    };
                }),
            };

            const response = await axios.post(
                PROXY_SERVER_URL,
                {
                    url:
                        OTTILA_BASE_URL +
                        "/XCon_Service/APIOut/Availability/1/HSearchByHotelCode_V2",
                    ...body,
                },
                {
                    headers: config.headers,
                }
            );

            console.log(response.data);
            console.log(first)

            let hotelBedHotels = [];
            if (response.data.hotels.hotels && response.data.hotels.hotels?.length > 0) {
                // const hbRateComments = await HotelHbRateComment.find({
                //     hotel: apiHotelCodes,
                // }).lean();

                function matchHotelBedsHotels(hotelAvailability) {
                    return new Promise(async (resolve, reject) => {
                        let apiRooms = [];
                        let minRateAdded = false;
                        let minRate = 0;
                        let minRateOffer = 0;
                        let maxRate = 0;

                        let roomCodes = hotelAvailability?.rooms?.map((item) => item?.code);

                        if (hotelAvailability?.rooms?.length > 0 && roomCodes?.length > 0) {
                            const roomTypes = await RoomType.find({
                                hotel: hotelsWithHbId[hotelAvailability?.code]?._id,
                                hotelBedRooms: { $in: roomCodes },
                                isDeleted: false,
                                isActive: true,
                            })
                                .populate("amenities", "name")
                                .lean();

                            if (roomTypes?.length > 0) {
                                for (let i = 0; i < hotelAvailability?.rooms?.length; i++) {
                                    const room = hotelAvailability?.rooms[i];

                                    let selRoomTypes = [];
                                    for (let m = 0; m < roomTypes?.length; m++) {
                                        if (roomTypes[m]?.hotelBedRooms?.includes(room?.code)) {
                                            selRoomTypes.push(roomTypes[m]);
                                        }
                                    }

                                    if (selRoomTypes?.length > 0) {
                                        for (let n = 0; n < selRoomTypes?.length; n++) {
                                            let apiRoom = {
                                                roomTypeId: selRoomTypes[n]?._id,
                                                roomType: {
                                                    _id: selRoomTypes[n]?._id,
                                                    roomName: selRoomTypes[n]?.roomName,
                                                    serviceBy: selRoomTypes[n]?.serviceBy,
                                                    amenities: selRoomTypes[n]?.amenities,
                                                    areaInM2: selRoomTypes[n]?.areaInM2,
                                                    images: selRoomTypes[n]?.images,
                                                },
                                                rates: [],
                                            };

                                            let marketMarkup;
                                            if (marketStrategy) {
                                                for (
                                                    let mi = 0;
                                                    mi < marketStrategy?.hotel?.length;
                                                    mi++
                                                ) {
                                                    if (
                                                        marketStrategy?.hotel[
                                                            mi
                                                        ]?.hotelId?.toString() ===
                                                        hotelsWithHbId[
                                                            hotelAvailability?.code
                                                        ]?._id?.toString()
                                                    ) {
                                                        for (
                                                            let mj = 0;
                                                            mj <
                                                            marketStrategy?.hotel[mi]?.roomTypes
                                                                ?.length;
                                                            mj++
                                                        ) {
                                                            let tempRmType =
                                                                marketStrategy?.hotel[mi]
                                                                    ?.roomTypes[mj];
                                                            if (
                                                                tempRmType?.roomTypeId?.toString() ===
                                                                selRoomTypes[n]?._id.toString()
                                                            ) {
                                                                marketMarkup = tempRmType;
                                                                break;
                                                            }
                                                        }

                                                        break;
                                                    }
                                                }
                                                if (!marketMarkup) {
                                                    for (
                                                        let mi = 0;
                                                        mi < marketStrategy?.starCategory?.length;
                                                        mi++
                                                    ) {
                                                        if (
                                                            marketStrategy?.starCategory[mi]
                                                                ?.name ===
                                                            hotelsWithHbId[hotelAvailability?.code]
                                                                ?.starCategory
                                                        ) {
                                                            marketMarkup =
                                                                marketStrategy?.starCategory[mi];
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                            let b2bMarkup;
                                            if (profileMarkup) {
                                                for (
                                                    let mi = 0;
                                                    mi < profileMarkup?.hotel?.length;
                                                    mi++
                                                ) {
                                                    if (
                                                        profileMarkup?.hotel[
                                                            mi
                                                        ]?.hotelId?.toString() ===
                                                        hotelsWithHbId[
                                                            hotelAvailability?.code
                                                        ]?._id?.toString()
                                                    ) {
                                                        for (
                                                            let mj = 0;
                                                            mj <
                                                            profileMarkup?.hotel[mi]?.roomTypes
                                                                ?.length;
                                                            mj++
                                                        ) {
                                                            let tempRmType =
                                                                profileMarkup?.hotel[mi]?.roomTypes[
                                                                    mj
                                                                ];
                                                            if (
                                                                tempRmType?.roomTypeId?.toString() ===
                                                                selRoomTypes[n]?._id.toString()
                                                            ) {
                                                                b2bMarkup = tempRmType;
                                                                break;
                                                            }
                                                        }

                                                        break;
                                                    }
                                                }
                                                if (!b2bMarkup) {
                                                    for (
                                                        let mi = 0;
                                                        mi < profileMarkup?.starCategory?.length;
                                                        mi++
                                                    ) {
                                                        if (
                                                            profileMarkup?.starCategory[mi]
                                                                ?.name ===
                                                            hotelsWithHbId[hotelAvailability?.code]
                                                                ?.starCategory
                                                        ) {
                                                            b2bMarkup =
                                                                profileMarkup?.starCategory[mi];
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                            let clientMarkup = clientMarkups?.find((item) => {
                                                return (
                                                    item?.roomTypeId?.toString() ===
                                                    selRoomTypes[n]?._id?.toString()
                                                );
                                            });
                                            if (!clientMarkup) {
                                                clientMarkup = clientStarCategoryMarkups?.find(
                                                    (item) => {
                                                        return (
                                                            item?.name ===
                                                            hotelsWithHbId[hotelAvailability?.code]
                                                                ?.starCategory
                                                        );
                                                    }
                                                );
                                            }
                                            let subAgentMarkup;
                                            if (reseller?.role === "sub-agent") {
                                                subAgentMarkup = subAgentMarkups?.find((item) => {
                                                    return (
                                                        item?.roomTypeId?.toString() ===
                                                        selRoomTypes[n]?._id?.toString()
                                                    );
                                                });
                                                if (!subAgentMarkup) {
                                                    subAgentMarkup =
                                                        subAgentStarCategoryMarkups?.find(
                                                            (item) => {
                                                                return (
                                                                    item?.name ===
                                                                    hotelsWithHbId[
                                                                        hotelAvailability?.code
                                                                    ]?.starCategory
                                                                );
                                                            }
                                                        );
                                                }
                                            }

                                            for (
                                                let j = 0;
                                                j < hotelAvailability?.rooms[i]?.rates?.length;
                                                j++
                                            ) {
                                                let rate = hotelAvailability?.rooms[i]?.rates[j];
                                                // if (rate?.rateType === "RECHECK" && 1 === 2) {
                                                //     const newRateRes = await getSingleHotelBedRate({
                                                //         rateKey: rate?.rateKey,
                                                //     });
                                                //     if (newRateRes[0]?.rooms[0]?.rates[0]) {
                                                //         rate = hotelAvailability?.rooms[i]?.rates[j];
                                                //         rate.rateComments = [rate.rateComments];
                                                //     }
                                                // }

                                                if (rate?.rateCommentsId && !rate?.rateComments) {
                                                    // TODO
                                                    // date conditon, rateCodes conditon
                                                    const splitRateComments =
                                                        rate?.rateCommentsId?.split("|");
                                                    let rateComments = [];
                                                    hbRateComments?.forEach((item) => {
                                                        if (
                                                            item.hotel ===
                                                                hotelAvailability?.code &&
                                                            item.incoming?.toString() ===
                                                                splitRateComments[0]?.toString() &&
                                                            item.code?.toString() ===
                                                                splitRateComments[1]?.toString()
                                                        ) {
                                                            item?.commentsByRates?.forEach(
                                                                (rateComment) => {
                                                                    rateComment?.comments?.forEach(
                                                                        (comment) => {
                                                                            rateComments.push(
                                                                                comment?.description
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    });

                                                    rate.rateComments = rateComments;
                                                }

                                                let netPriceAED = Number(rate?.net);
                                                let priceWithMarkup = netPriceAED;

                                                let adminMarketMarkup = 0;
                                                if (
                                                    marketMarkup &&
                                                    !isNaN(marketMarkup.markupApi)
                                                ) {
                                                    if (marketMarkup.markupTypeApi === "flat") {
                                                        adminMarketMarkup =
                                                            marketMarkup.markupApi * noOfNights;
                                                    } else {
                                                        adminMarketMarkup =
                                                            (priceWithMarkup / 100) *
                                                            marketMarkup.markupApi;
                                                    }
                                                }
                                                priceWithMarkup += adminMarketMarkup;

                                                let adminB2bMarkup = 0;
                                                if (b2bMarkup && !isNaN(b2bMarkup.markupApi)) {
                                                    if (b2bMarkup.markupTypeApi === "flat") {
                                                        adminB2bMarkup =
                                                            b2bMarkup.markupApi * noOfNights;
                                                    } else {
                                                        adminB2bMarkup =
                                                            (priceWithMarkup / 100) *
                                                            b2bMarkup.markupApi;
                                                    }
                                                }
                                                priceWithMarkup += adminB2bMarkup;

                                                let saMarkup = 0;
                                                if (
                                                    subAgentMarkup &&
                                                    !isNaN(subAgentMarkup.markup)
                                                ) {
                                                    if (subAgentMarkup.markupType === "flat") {
                                                        saMarkup =
                                                            subAgentMarkup.markup * noOfNights;
                                                    } else {
                                                        saMarkup =
                                                            (priceWithMarkup / 100) *
                                                            subAgentMarkup.markup;
                                                    }
                                                }
                                                priceWithMarkup += saMarkup;

                                                let clMarkup = 0;
                                                if (clientMarkup && !isNaN(clientMarkup.markup)) {
                                                    if (clientMarkup.markupType === "flat") {
                                                        clMarkup = clientMarkup.markup * noOfNights;
                                                    } else {
                                                        clMarkup =
                                                            (priceWithMarkup / 100) *
                                                            clientMarkup.markup;
                                                    }
                                                }
                                                priceWithMarkup += clMarkup;

                                                const totalOffer =
                                                    rate?.offers?.reduce(
                                                        (a, b) => a + Math.abs(b?.amount),
                                                        0
                                                    ) || 0;

                                                apiRoom.rates.push({
                                                    rateKey: rate?.rateKey,
                                                    rateName:
                                                        apiRoom?.roomType?.roomName +
                                                        " with " +
                                                        rate?.boardName?.toLowerCase(),
                                                    boardCode: rate?.boardCode,
                                                    boardName: rate?.boardName?.toLowerCase(),
                                                    selectedRoomOccupancies: [
                                                        {
                                                            occupancyId: undefined,
                                                            occupancyName:
                                                                hotelAvailability?.rooms[
                                                                    i
                                                                ]?.name?.toLowerCase(),
                                                            shortName: "",
                                                            count: rate?.rooms,
                                                            price: netPriceAED,
                                                            rollBedApplied: 0,
                                                            extraBedApplied: 0,
                                                        },
                                                    ],
                                                    roomPrice: netPriceAED,
                                                    netPrice: priceWithMarkup,
                                                    grossPrice: priceWithMarkup + totalOffer,
                                                    addOnsTxt: [],
                                                    promotions:
                                                        rate?.promotions?.map((item) => {
                                                            return item.name;
                                                        }) || [],
                                                    availableAllocation: rate?.allotment,
                                                    cancellationPolicies:
                                                        rate?.cancellationPolicies?.map((item) => {
                                                            return `If you cancel this booking from ${item?.from} you will be charged ${item?.amount} AED.`;
                                                        }),
                                                    cancellationType: "",
                                                    totalOffer,
                                                    rateComments: rate?.rateComments || [],
                                                    markup: {
                                                        adminMarketMarkup,
                                                        adminB2bMarkup, // admin markup for b2b
                                                        subAgentMarkup: saMarkup, // markup for subagents from agent
                                                        clientMarkup: clMarkup, // markup for client
                                                    },
                                                    isApiConnected: true,
                                                });

                                                if (minRate === 0 && minRateAdded === false) {
                                                    minRate = priceWithMarkup;
                                                    minRateOffer = totalOffer;
                                                    minRateAdded = true;
                                                } else if (minRate > priceWithMarkup) {
                                                    minRate = priceWithMarkup;
                                                    minRateOffer = totalOffer;
                                                } else if (maxRate < priceWithMarkup) {
                                                    maxRate = priceWithMarkup;
                                                }
                                            }

                                            const objIndex = apiRooms?.findIndex((item) => {
                                                return (
                                                    item?.roomTypeId?.toString() ===
                                                    apiRoom?.roomTypeId?.toString()
                                                );
                                            });
                                            if (objIndex !== -1) {
                                                apiRooms[objIndex].rates.push(...apiRoom.rates);
                                            } else {
                                                apiRooms.push(apiRoom);
                                            }
                                        }
                                    }
                                }
                                if (apiRooms?.length > 0) {
                                    hotelBedHotels.push({
                                        hotel: hotelsWithHbId[hotelAvailability?.code],
                                        rooms: apiRooms,
                                        minRate,
                                        maxRate,
                                        totalOffer: minRateOffer,
                                        noOfNights,
                                    });
                                }
                            }
                        }

                        resolve();
                    });
                }

                let promises = [];
                response.data.hotels.hotels?.forEach((hotelAvailability) => {
                    promises.push(matchHotelBedsHotels(hotelAvailability));
                });

                await Promise.all(promises);
            }
            console.timeEnd("hotel bed search");
            return { ottilaHotels };
        }

        return { ottilaHotels: [] };
    } catch (err) {
        console.log(err?.response?.data?.error);
        throw err;
    }
};

module.exports = { getOttilaHotelsAvailabilityByHCode, getSingleOttilaHotelAvailability };
