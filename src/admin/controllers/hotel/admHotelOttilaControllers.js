const axios = require("axios");

const { sendErrorResponse } = require("../../../helpers");
const { OttilaCountry } = require("../../../models/Ottila");
const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");


const data = readDataFromFile()

const OTTILA_BASE_URL = data?.OTTILA_BASE_URL;
const PROXY_SERVER_URL = "https://dev.mytravellerschoice.com/proxy";
const config = {
    headers: {
        UserName: data?.OTTILA_USERNAME,
        Password: data?.OTTILA_PASSWORD,
    },
};

module.exports = {
    upsertOttilaCountries: async (req, res) => {
        try {
            const url = OTTILA_BASE_URL + "/XCon_Service/APIOut/StaticData/1/GetCountryList";
            const response = await axios.post(
                PROXY_SERVER_URL,
                { url },
                {
                    headers: config.headers,
                }
            );

            let upsertedCountries = 0;
            for (let country of response.data) {
                if (country?.CountryId && country?.ISOCode) {
                    await OttilaCountry.findOneAndUpdate(
                        { ottilaCountryId: country?.CountryId },
                        {
                            ottilaCountryId: country?.CountryId,
                            isocode: country?.ISOCode,
                        },
                        { upsert: true, runValidators: true }
                    );

                    upsertedCountries += 1;
                }

                console.log("country", country?.ISOCode);
            }

            res.status(200).json({
                message: "ottila's countries successfully upserted",
                totalCountries: response.data?.length,
                upsertedCountries,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
