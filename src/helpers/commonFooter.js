const { readDataFromFile } = require("../controllers/initial/SaveDataFile");
const { B2cHomeSettings } = require("../models");
const data = readDataFromFile()

module.exports = async () => {
    const companyDetails = await B2cHomeSettings.findOne();
    const companyLogo = data?.COMPANY_LOGO;
    const companyRegName = data?.COMPANY_REGISTRATION_NAME;
    return `
    <span>Best Regards</span> <br />
    <span>${data?.COMPANY_NAME}</span><br />
    <span>Email :- ${companyDetails.email}</span> <br />
    <span>WhatsApp :-${companyDetails.phoneNumber1}</span> <br />
    <span>Customer Care :- ${companyDetails.phoneNumber2} </span> <br />
    <hr style="border:none; border-top:1px solid #eee" /> <br />
    <img src="${companyLogo}" width="150" /> <br />

    `;
};
