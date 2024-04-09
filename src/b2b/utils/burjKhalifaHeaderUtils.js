const { readDataFromFile } = require("../../controllers/initial/SaveDataFile");
const { ApiMaster } = require("../../models");
const axios = require("axios");
const data = readDataFromFile()


module.exports = {
    getApiHeadersAndUrl: async () => {
        try {
            const api = await ApiMaster.findOne({ apiCode: "ATBRJ01" });
            const username = data?.BURJ_KHALIFA_USERNAME;
            const password = data?.BURJ_KHALIFA_PASSWORD;
            const credentials = `${username}:${password}`;
            const authHeader = `Basic ${Buffer.from(credentials).toString("base64")}`;

            const url = api.liveUrl;
            return {
                headers: {
                    "Content-Type": "text/xml; charset=utf-8",
                    Authorization: authHeader,
                },
                url,
                api,
                authHeader,
            };
        } catch {
            throw err;
        }
    },
};
