const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");
const { sendEmail } = require("../../../helpers");
const data = readDataFromFile()

const companyLogo = data?.COMPANY_LOGO;
const companyRegName = data?.COMPANY_REGISTRATION_NAME;

const hotelOrderCancellationRequestEmailForReseller = ({ email, name, referenceNumber }) => {
    try {
        const subject = `Cancellation of hotel order ${referenceNumber}`;
        sendEmail(
            email,
            subject,
            `
        <span>Dear ${name}</span><br />
        <br />
        <span>Your cancellation request has been received and is being processed with the hotel.</span><br />
        <span>Should there be a cancellation charge the Team will update you separately.</span><br />

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

module.exports = hotelOrderCancellationRequestEmailForReseller;
