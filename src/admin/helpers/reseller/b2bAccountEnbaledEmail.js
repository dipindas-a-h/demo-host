const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");
const { sendEmail } = require("../../../helpers");


const data = readDataFromFile()
const companyLogo = data?.COMPANY_LOGO;
const companyRegName = data?.COMPANY_REGISTRATION_NAME;
const companyName = data?.COMPANY_NAME;

const b2bAccountEnbaledEmail = async ({ name, email }) => {
    try {
        sendEmail(
            email,
            `Your ${companyName}'s b2b account status update`,
            `<span>Dear ${name}</span><br />
            <br />
            <span>Your account status hase been Re-enabled by the admin.</span><br />
            <br />
            <br />
            <span>Thanks and regards</span><br />
            <span>${companyRegName}</span><br />
            <img src="${companyLogo}" width="150" />
   `
        );
    } catch (err) {
        console.log(err);
    }
};

module.exports = b2bAccountEnbaledEmail;
