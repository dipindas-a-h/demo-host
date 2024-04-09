const { readDataFromFile } = require("../../../controllers/initial/SaveDataFile");
const { sendEmail } = require("../../../helpers");


const data = readDataFromFile()
const companyLogo = data?.COMPANY_LOGO;
const companyRegName = data?.COMPANY_REGISTRATION_NAME;

const sendResellerUpdatedCredentials = async ({ companyName, email, password, agentCode }) => {
    try {
        sendEmail(
            email,
            `Your ${data?.COMPANY_NAME} B2B portal's account informations updated`,
            `<div>
                <span>We welcome ${companyName} to the ${
                data?.COMPANY_NAME
            } Booking environment. Please find your b2b account details below</span>
                <br />
                <br />
                <span>URL : ${data?.B2B_WEB_URL}</span><br />
                <span>Agent Code : ${agentCode}</span><br />
                <span>Email : ${email}</span><br />
                ${password ? `<span>Password : ${password}</span>` : ""}
                <br />
                <br />
                <span>Thanks and regards</span><br />
                <span>${companyRegName}</span><br />
                <img src="${companyLogo}" width="150" />
            </div>`
        );
    } catch (error) {
        console.log(error);
        console.log("E-mail not sent");
    }
};

module.exports = sendResellerUpdatedCredentials;
