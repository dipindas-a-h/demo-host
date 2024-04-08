const { sendErrorResponse } = require("../../../helpers");
const { Transfer } = require("../../../models/transfer");
const { b2bTransferAvailabilitySchema } = require("../../validations/transfer/b2bTransfer.schema");
const { State, City, Area } = require("../../../models/global");
const { Attraction, Airport, GroupArea, Banner, Country, B2bBanner } = require("../../../models");
const { saveCustomCache, getSavedCache } = require("../../../config/cache");
const { Hotel } = require("../../../models/hotel");
const {
    B2BMarkupProfile,
    B2BClientTransferMarkup,
    B2BSubAgentTransferMarkup,
} = require("../../models");
const { MarketStrategy } = require("../../../admin/models");

module.exports = {
    getSearchSuggestions: async (req, res) => {
        try {
            const { search, isoCode } = req.query;

            const searchWords = search?.toLowerCase()?.split(" ");

            if (!search || search?.length < 3) {
                return sendErrorResponse(res, 400, "invalid search. atleast 3 characters required");
            }

            let countryId;
            if (isoCode) {
                let country = await Country.findOne({ isocode: isoCode, isDeleted: false });

                if (!country) {
                    return sendErrorResponse(res, 400, "country not found");
                }
                countryId = country?._id;
            }

            console.time("fetching");

            let attractions = await getSavedCache("suggestion-attraction");
            if (!attractions || attractions?.length < 1) {
                attractions = await Attraction.find({ isDeleted: false })
                    .populate("country", "_id countryName")
                    .populate("state", "_id stateName")
                    .populate("city", "_id cityName")
                    .populate("area", "areaName")
                    .select("_id title area areaName propertyCount country state city")
                    .lean();
                saveCustomCache("suggestion-attractions", attractions, 60 * 60 * 24 * 10); // 10 days
            }

            let airports = await getSavedCache("suggestion-airports");
            if (!airports || airports?.length < 1) {
                airports = await Airport.find({ isDeleted: false })
                    .populate("country", "_id countryName")
                    .select("_id airportName country")
                    .lean();
                saveCustomCache("suggestion-airports", airports, 60 * 60 * 24 * 10); // 10 days
            }

            let areas = await getSavedCache("suggestion-areas");
            if (!areas || areas?.length < 1) {
                areas = await Area.find({ isDeleted: false })
                    .populate("propertyCount")
                    .populate("country", "_id countryName")
                    .populate("state", "_id stateName")
                    .populate("city", "_id cityName")
                    .select("_id areaName propertyCount country state city")
                    .lean();
                saveCustomCache("suggestion-areas", areas, 60 * 60 * 24 * 10); // 10 days
            }
            let hotels = await getSavedCache("suggestion-hotels");
            if (!hotels || hotels.length < 1) {
                const hotels = await Hotel.find({
                    isActive: true,
                    isPublished: true,
                    isDeleted: false,
                })
                    .populate("country", "countryName")
                    .populate("state", "stateName")
                    .populate("city", "cityName")
                    .populate("area", "areaName")
                    .select("_id hotelName country city state area areaName")
                    .lean();
                saveCustomCache("suggestion-hotels", hotels, 60 * 60 * 24 * 10); // 10 days
            }

            let promises = [];
            promises.push(
                (async () => {
                    return areas
                        ?.filter((area) => {
                            return (
                                searchWords?.every((item) => {
                                    return area?.areaName
                                        ?.replaceAll(" ", "")
                                        ?.toLowerCase()
                                        ?.includes(item);
                                }) &&
                                (countryId
                                    ? area?.country?._id?.toString() === countryId?.toString()
                                    : true)
                            );
                        })
                        ?.sort((a, b) => b?.propertyCount - a?.propertyCount)
                        ?.slice(0, 3)
                        ?.map((item) => {
                            return {
                                _id: item?._id,
                                suggestionType: "AREA",
                                countryName: item?.country?.countryName,
                                stateName: item?.state?.stateName,
                                cityName: item?.city?.cityName,
                                areaName: item?.areaName,
                                areaId: item?._id,
                                propertyCount: item?.propertyCount,
                            };
                        });
                })()
            );

            promises.push(
                (async () => {
                    return hotels
                        ?.filter((hotel) => {
                            return (
                                searchWords?.every((item) => {
                                    return (
                                        hotel?.hotelName
                                            ?.replaceAll(" ", "")
                                            ?.toLowerCase()
                                            ?.includes(item) && hotel?.area?.areaName
                                    );
                                }) &&
                                (countryId
                                    ? hotel?.country?._id?.toString() === countryId?.toString()
                                    : true)
                            );
                        })
                        ?.slice(0, 5)
                        ?.map((item) => {
                            return {
                                _id: item?._id,
                                suggestionType: "HOTEL",
                                countryName: item?.country?.countryName,
                                stateName: item?.state?.stateName,
                                cityName: item?.city?.cityName,
                                areaName: item?.area?.areaName,
                                areaId: item?.area?._id,
                                hotelName: item?.hotelName,
                                hotelId: item?._id,
                            };
                        });
                })()
            );

            promises.push(
                (async () => {
                    return attractions
                        ?.filter((attraction) => {
                            return (
                                searchWords?.every((item) => {
                                    return (
                                        attraction?.title
                                            ?.replaceAll(" ", "")
                                            ?.toLowerCase()
                                            ?.includes(item) && attraction?.area?.areaName
                                    );
                                }) &&
                                (countryId
                                    ? attraction?.country?._id?.toString() === countryId?.toString()
                                    : true)
                            );
                        })
                        ?.slice(0, 5)
                        ?.map((item) => {
                            return {
                                _id: item?._id,
                                suggestionType: "ATTRACTION",
                                countryName: item?.country?.countryName,
                                stateName: item?.state?.stateName,
                                cityName: item?.city?.cityName,
                                areaName: item?.area?.areaName,
                                areaId: item?.area?._id,
                                attractionName: item?.title,
                                attractionId: item?._id,
                            };
                        });
                })()
            );

            promises.push(
                (async () => {
                    return airports
                        ?.filter((airport) => {
                            return (
                                searchWords?.every((item) => {
                                    return airport?.airportName
                                        ?.replaceAll(" ", "")
                                        ?.toLowerCase()
                                        ?.includes(item);
                                }) &&
                                (countryId
                                    ? airport?.country?._id?.toString() === countryId?.toString()
                                    : true)
                            );
                        })
                        ?.slice(0, 5)
                        ?.map((item) => {
                            return {
                                _id: item?._id,
                                suggestionType: "AIRPORT",
                                countryName: item?.country?.countryName,
                                airportName: item?.airportName,
                                airportId: item?._id,
                            };
                        });
                })()
            );

            const response = await Promise.all(promises);

            console.timeEnd("fetching");

            res.status(200).json({
                areas: response[0],
                hotels: response[1],
                attractions: response[2],
                airports: response[3],
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    searchTransferAvailability: async (req, res) => {
        try {
            const {
                transferType,
                pickupSuggestionType,
                pickupLocation,
                dropOffSuggestionType,
                dropOffLocation,
                pickupDate,
                pickupTime,
                returnDate,
                returnTime,
                noOfAdults,
                noOfChildrens,
            } = req.body;

            const { error } = b2bTransferAvailabilitySchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            let transferFromId;
            let transferToId;
            let transferFrom;
            let transferTo;

            let profile = await B2BMarkupProfile.findOne({
                resellerId: req?.reseller?._id,
            });

            let market = await MarketStrategy.findOne({
                _id: req?.reseller?.marketStrategy,
            });
            if (pickupSuggestionType === "AREA") {
                transferFrom = await Area.findOne({ _id: pickupLocation }).lean();
                if (!transferFrom) {
                    return sendErrorResponse(res, 400, "area not found");
                }

                let transferFromGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferFrom?._id] },
                });

                if (!transferFromGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferFrom.name = transferFrom?.areaName;

                transferFromId = transferFromGroup._id;
            } else if (pickupSuggestionType === "HOTEL") {
                let hotel = await Hotel.findOne({ _id: pickupLocation });
                if (!hotel) {
                    return sendErrorResponse(res, 400, "hotel not found");
                }

                transferFrom = await Area.findOne({ _id: hotel?.area }).lean();
                if (!transferFrom) {
                    return sendErrorResponse(res, 400, "hotel area not found");
                }

                transferFrom.name = hotel?.hotelName;

                let transferFromGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferFrom?._id] },
                });

                if (!transferFromGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferFromId = transferFromGroup._id;
            } else if (pickupSuggestionType === "ATTRACTION") {
                let attraction = await Attraction.findOne({ _id: pickupLocation });
                if (!attraction) {
                    return sendErrorResponse(res, 400, "attraction not found");
                }

                transferFrom = await Area.findOne({ _id: attraction?.area }).lean();
                if (!transferFrom) {
                    return sendErrorResponse(res, 400, "attraction area not found");
                }

                transferFrom.name = attraction?.title;

                let transferFromGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferFrom?._id] },
                });

                if (!transferFromGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferFromId = transferFromGroup._id;
            } else if (pickupSuggestionType === "AIRPORT") {
                transferFromId = pickupLocation;
                transferFrom = await Airport.findOne({ _id: pickupLocation }).select(
                    "airportName place"
                );
            } else {
                return sendErrorResponse(res, 400, "suggestion  found in group");
            }

            if (dropOffSuggestionType === "AREA") {
                transferTo = await Area.findOne({ _id: dropOffLocation }).lean();
                if (!transferTo) {
                    return sendErrorResponse(res, 400, "area not found");
                }

                let transferToGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferTo?._id] },
                });

                if (!transferToGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferTo.name = transferTo?.areaName;

                transferToId = transferToGroup._id;
            } else if (dropOffSuggestionType === "HOTEL") {
                let hotel = await Hotel.findOne({ _id: dropOffLocation }).select("hotelName area");
                if (!hotel) {
                    return sendErrorResponse(res, 400, "hotel not found");
                }

                transferTo = await Area.findOne({ _id: hotel?.area }).lean();
                if (!transferTo) {
                    return sendErrorResponse(res, 400, "hotel area not found");
                }

                let transferToGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferTo?._id] },
                });

                if (!transferToGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferTo.name = hotel?.hotelName;
                transferTo._id = hotel?._id;

                transferToId = transferToGroup._id;
            } else if (dropOffSuggestionType === "ATTRACTION") {
                let attraction = await Attraction.findOne({ _id: dropOffLocation });

                transferTo = await Area.findOne({ _id: attraction?.area }).lean();
                if (!transferTo) {
                    return sendErrorResponse(res, 400, "attraction area not found");
                }

                let transferToGroup = await GroupArea.findOne({
                    isDeleted: false,
                    areas: { $in: [transferTo?._id] },
                });

                if (!transferToGroup) {
                    return sendErrorResponse(res, 400, "area not found in group");
                }

                transferTo.name = attraction?.title;
                transferTo._id = attraction?._id;

                transferToId = transferToGroup._id;
            } else if (dropOffSuggestionType === "AIRPORT") {
                transferToId = dropOffLocation;
                transferTo = await Airport.findOne({ _id: dropOffLocation }).select(
                    "airportName place"
                );
            } else {
                return sendErrorResponse(res, 400, "suggestion  found in group");
            }

            const transfers = await Transfer.findOne({
                transferFrom: transferFromId,
                transferTo: transferToId,
            })
                .populate({
                    path: "vehicleType.vehicle",
                    populate: {
                        path: "vehicleCategoryId",
                    },
                })
                .lean();

            if (!transfers) {
                return sendErrorResponse(res, 400, "transfer not found for this combination ");
            }

            if (!transfers?.vehicleType || transfers?.vehicleType?.length < 1) {
                return sendErrorResponse(
                    res,
                    400,
                    "transfer vehicles not found for this combination "
                );
            }

            let markMarkup = market?.transfer?.find(
                (transfer) => transfer?.transferId?.toString() === transfers?._id?.toString()
            );

            let profMarkup = profile?.transfer?.find(
                (transfer) => transfer?.transferId?.toString() === transfers?._id?.toString()
            );

            let cliMarkup = await B2BClientTransferMarkup.findOne({
                resellerId: req?.reseller?._id,
                transferId: transfers?._id,
                isDeleted: false,
            });

            let subAgentMarkup = await B2BSubAgentTransferMarkup.findOne({
                resellerId: req?.reseller?._id,
                transferId: transfers?._id,
                isDeleted: false,
            });

            console.log(transfers?.vehicleType, "transfers?.vehicleType");

            let filteredVehicles = transfers?.vehicleType;
            // if (pickupSuggestionType === "AIRPORT" || dropOffSuggestionType === "AIRPORT") {
            //     filteredVehicles = transfers?.vehicleType?.filter((vehicleTy) => {
            //         return vehicleTy.vehicle.airportOccupancy >= noOfAdults + noOfChildrens;
            //     });
            // } else if (pickupSuggestionType === "HOTEL" && dropOffSuggestionType === "HOTEL") {
            //     filteredVehicles = transfers?.vehicleType?.filter((vehicleTy) => {
            //         return vehicleTy?.vehicle?.airportOccupancy >= noOfAdults + noOfChildrens;
            //     });
            // } else {
            //     filteredVehicles = transfers?.vehicleType?.filter((vehicleTy) => {
            //         return vehicleTy?.vehicle?.normalOccupancy >= noOfAdults + noOfChildrens;
            //     });
            // }

            // console.log(filteredVehicles, "transfers?.vehicleType2");

            filteredVehicles?.sort(
                (a, b) => a?.vehicle?.normalOccupancy - b?.vehicle?.normalOccupancy
            );

            console.log(filteredVehicles, "transfers?.vehicleType3");

            filteredVehicles = filteredVehicles?.map((vehicle) => {
                let totalPrice = vehicle?.price;
                let marketVehicle;
                let profileVehicle;
                let clientVehicle;
                let subAgentVehicle;

                if (markMarkup) {
                    marketVehicle = markMarkup?.vehicleType?.find((vehTy) => {
                        return vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString();
                    });
                }

                if (profMarkup) {
                    profileVehicle = profMarkup?.vehicleType?.find((vehTy) => {
                        return vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString();
                    });
                }
                if (cliMarkup) {
                    clientVehicle = cliMarkup?.vehicleType?.find((vehTy) => {
                        return vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString();
                    });
                }
                if (subAgentMarkup && req?.reseller?.role.toString() === "sub-agent") {
                    subAgentVehicle = subAgentMarkup?.vehicleType?.find((vehTy) => {
                        return vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString();
                    });
                }

                if (marketVehicle) {
                    let markup = 0;
                    if (marketVehicle?.markupType === "flat") {
                        markup = Number(marketVehicle?.markup);
                    } else {
                        markup = (Number(marketVehicle?.markup) * Number(totalPrice)) / 100;
                    }
                    totalPrice += Number(markup);
                }

                if (profileVehicle) {
                    let markup = 0;
                    if (profileVehicle.markupType === "flat") {
                        markup = Number(profileVehicle.markup);
                    } else {
                        markup = (Number(profileVehicle.markup) * Number(totalPrice)) / 100;
                    }
                    totalPrice += Number(markup);
                }

                if (clientVehicle) {
                    let markup = 0;
                    if (clientVehicle?.markupType === "flat") {
                        markup = Number(clientVehicle.markup);
                    } else {
                        markup = (Number(clientVehicle.markup) * Number(totalPrice)) / 100;
                    }
                    totalPrice += Number(markup);
                }

                if (subAgentVehicle) {
                    let markup = 0;
                    if (subAgentVehicle?.markupType === "flat") {
                        markup = Number(subAgentVehicle.markup);
                    } else {
                        markup = (Number(subAgentVehicle.markup) * Number(totalPrice)) / 100;
                    }
                    totalPrice += Number(markup);
                }

                return {
                    ...vehicle,
                    price: totalPrice,
                };
            });

            console.log(filteredVehicles, "transfers?.vehicleType4");

            // do the logic for vehicle exist or not
            trips = [];

            trips.push({
                date: pickupDate,
                time: pickupTime,
                transfer: transfers?.transferType,
                suggestionType: `${pickupSuggestionType}-${dropOffSuggestionType}`,
                transferFrom,
                transferTo,
                vehicles: filteredVehicles,
            });

            if (transferType === "return") {
                let transferFromId;
                let transferToId;
                let transferFrom;
                let transferTo;
                if (dropOffSuggestionType === "AREA") {
                    transferFrom = await Area.findOne({ _id: dropOffLocation });
                    if (!transferFrom) {
                        return sendErrorResponse(res, 400, "area not found");
                    }

                    let transferFromGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferFrom?._id] },
                    });

                    if (!transferFromGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferFrom.name = transferFrom?.areaName;

                    transferFromId = transferFromGroup._id;
                } else if (dropOffSuggestionType === "HOTEL") {
                    let hotel = await Hotel.findOne({ _id: dropOffLocation });
                    if (!hotel) {
                        return sendErrorResponse(res, 400, "hotel not found");
                    }

                    transferFrom = await Area.findOne({ _id: hotel?.area }).lean();
                    if (!transferFrom) {
                        return sendErrorResponse(res, 400, "area not found");
                    }

                    transferFrom.name = hotel?.hotelName;
                    transferFrom._id = hotel?._id;

                    let transferFromGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferFrom?._id] },
                    });

                    if (!transferFromGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferFromId = transferFromGroup._id;
                } else if (dropOffSuggestionType === "ATTRACTION") {
                    let attraction = await Attraction.findOne({ _id: dropOffLocation });

                    if (!attraction) {
                        return sendErrorResponse(res, 400, "hotel not found");
                    }

                    transferFrom = await Area.findOne({ _id: attraction?.area }).lean();
                    if (!transferFrom) {
                        return sendErrorResponse(res, 400, "area not found");
                    }

                    transferFrom.name = attraction?.title;
                    transferFrom._id = attraction?._id;

                    let transferFromGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferFrom?._id] },
                    });

                    if (!transferFrom) {
                        return sendErrorResponse(res, 400, "hotel area not found");
                    }

                    if (!transferFromGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferFromId = transferFromGroup._id;
                } else if (dropOffSuggestionType === "AIRPORT") {
                    transferFromId = dropOffLocation;
                    transferFrom = await Airport.findOne({ _id: dropOffLocation }).select(
                        "airportName place"
                    );
                } else {
                    return sendErrorResponse(res, 400, "suggestion  found in group");
                }

                if (pickupSuggestionType === "AREA") {
                    transferTo = await Area.findOne({ _id: pickupLocation }).lean();
                    if (!transferTo) {
                        return sendErrorResponse(res, 400, "area not found");
                    }

                    let transferToGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferFrom?._id] },
                    });

                    if (!transferToGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferTo.name = transferTo?.areaName;

                    transferToId = transferToGroup._id;
                } else if (pickupSuggestionType === "HOTEL") {
                    let hotel = await Hotel.findOne({ _id: pickupLocation });
                    if (!hotel) {
                        return sendErrorResponse(res, 400, "hotel not found");
                    }

                    transferTo = await Area.findOne({ _id: hotel?.area }).lean();
                    if (!transferTo) {
                        return sendErrorResponse(res, 400, "hotel area not found");
                    }

                    let transferToGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferTo?._id] },
                    });

                    if (!transferToGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferTo.name = hotel?.hotelName;

                    transferToId = transferToGroup._id;
                } else if (pickupSuggestionType === "ATTRACTION") {
                    let attraction = await Attraction.findOne({ _id: pickupLocation });
                    if (!attraction) {
                        return sendErrorResponse(res, 400, "attraction area not found");
                    }
                    transferTo = await Area.findOne({ _id: attraction?.area }).lean();
                    if (!transferTo) {
                        return sendErrorResponse(res, 400, "attraction area not found");
                    }
                    let transferToGroup = await GroupArea.findOne({
                        isDeleted: false,
                        areas: { $in: [transferTo?._id] },
                    });

                    if (!transferToGroup) {
                        return sendErrorResponse(res, 400, "area not found in group");
                    }

                    transferTo.name = attraction?.title;

                    transferToId = transferToGroup._id;
                } else if (pickupSuggestionType === "AIRPORT") {
                    transferToId = pickupLocation;
                    transferTo = await Airport.findOne({ _id: pickupLocation }).select(
                        "airportName place"
                    );
                } else {
                    return sendErrorResponse(res, 400, "suggestion  found in group");
                }

                const transfers = await Transfer.findOne({
                    transferFrom: transferFromId,
                    transferTo: transferToId,
                })
                    .populate({
                        path: "vehicleType.vehicle",
                        populate: {
                            path: "vehicleCategoryId",
                        },
                    })
                    .lean();

                if (!transfers) {
                    return sendErrorResponse(res, 400, "transfer not found for this combination ");
                }

                if (!transfers?.vehicleType || transfers?.vehicleType?.length < 1) {
                    return sendErrorResponse(
                        res,
                        400,
                        "transfer vehicles not found for this combination "
                    );
                }

                let filteredVehicles = transfers?.vehicleType;
                // if (pickupSuggestionType === "AIRPORT" || dropOffSuggestionType !== "AIRPORT") {
                //     filteredVehicles = transfers.vehicleType?.filter((vehicleTy) => {
                //         return vehicleTy?.vehicle?.airportOccupancy >= noOfAdults + noOfChildrens;
                //     });
                // } else if (pickupSuggestionType === "HOTEL" && dropOffSuggestionType !== "HOTEL") {
                //     filteredVehicles = transfers?.vehicleType?.filter((vehicleTy) => {
                //         return vehicleTy?.vehicle.airportOccupancy >= noOfAdults + noOfChildrens;
                //     });
                // } else {
                //     filteredVehicles = transfers?.vehicleType?.filter((vehicleTy) => {
                //         return vehicleTy?.vehicle?.normalOccupancy >= noOfAdults + noOfChildrens;
                //     });
                // }

                filteredVehicles?.sort(
                    (a, b) => a?.vehicle?.normalOccupancy - b?.vehicle?.normalOccupancy
                );

                filteredVehicles = filteredVehicles.map((vehicle) => {
                    let totalPrice = vehicle?.price;
                    let marketVehicle;
                    let profileVehicle;
                    let clientVehicle;
                    let subAgentVehicle;

                    if (markMarkup) {
                        marketVehicle = markMarkup?.vehicleType?.find((vehTy) => {
                            return (
                                vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString()
                            );
                        });
                    }

                    if (profMarkup) {
                        profileVehicle = profMarkup?.vehicleType?.find((vehTy) => {
                            return (
                                vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString()
                            );
                        });
                    }
                    if (cliMarkup) {
                        clientVehicle = cliMarkup?.vehicleType?.find((vehTy) => {
                            return (
                                vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString()
                            );
                        });
                    }

                    if (subAgentMarkup && req?.reseller?.role.toString() === "sub-agent") {
                        subAgentVehicle = subAgentMarkup?.vehicleType?.find((vehTy) => {
                            return (
                                vehTy?.vehicleId?.toString() === vehicle?.vehicle?._id?.toString()
                            );
                        });
                    }

                    if (marketVehicle) {
                        let markup = 0;
                        if (marketVehicle?.markupType === "flat") {
                            markup = Number(marketVehicle?.markup);
                        } else {
                            markup = (Number(marketVehicle?.markup) * Number(totalPrice)) / 100;
                        }
                        totalPrice += Number(markup);
                    }

                    if (profileVehicle) {
                        let markup = 0;
                        if (profileVehicle.markupType === "flat") {
                            markup = Number(profileVehicle.markup);
                        } else {
                            markup = (Number(profileVehicle.markup) * Number(totalPrice)) / 100;
                        }
                        totalPrice += Number(markup);
                    }

                    if (clientVehicle) {
                        let markup = 0;
                        if (clientVehicle?.markupType === "flat") {
                            markup = Number(clientVehicle.markup);
                        } else {
                            markup = (Number(clientVehicle.markup) * Number(totalPrice)) / 100;
                        }
                        totalPrice += Number(markup);
                    }

                    if (subAgentVehicle) {
                        let markup = 0;
                        if (subAgentVehicle.markupType === "flat") {
                            markup = Number(subAgentVehicle.markup);
                        } else {
                            markup = (Number(subAgentVehicle.markup) * Number(totalPrice)) / 100;
                        }
                        totalPrice += Number(markup);
                    }

                    return {
                        ...vehicle,
                        price: totalPrice,
                    };
                });

                trips.push({
                    date: returnDate,
                    time: returnTime,
                    transfer: transfers?.transferType,
                    suggestionType: `${dropOffSuggestionType}-${pickupSuggestionType}`,
                    transferFrom,
                    transferTo,
                    vehicles: filteredVehicles,
                });
            }
            res.status(200).json({
                transferType,
                noOfAdults,
                noOfChildrens,
                pickupSuggestionType,
                pickupLocation,
                dropOffSuggestionType,
                dropOffLocation,
                trips,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getBannaers: async (req, res) => {
        try {
            const banner = await B2bBanner.findOne({ name: "transfer", isDeleted: false });

            if (banner) {
                banner.banners = banner.banners.filter((item) => !item.isDeleted);
            } else {
                return sendErrorResponse(res, 404, "banner not found");
            }

            res.status(200).json(banner.banners || []);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
