const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");

const createInsurnacePlansUtils = (generalData, beneficiaryData) => {
    try {
        const configData = readDataFromFile()
        const data = {
            businessLine: "travel",
            contractType: generalData.travelType,
            agency: configData?.CYGNET_AGENCY,
            countryOfResidence: "ARE",
            destinations: [
                {
                    countrycode: generalData.destination,
                    startperiod: generalData.travelFrom,
                    endperiod: generalData.travelTo,
                },
            ],
            beneficiaries: beneficiaryData.map((benData, index) => {
                return {
                    borndate: benData.dateOfBirth,
                    beneficiaryType: index === 0 ? "01" : "03",
                };
            }),
        };

        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports = createInsurnacePlansUtils;
