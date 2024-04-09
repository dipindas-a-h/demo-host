const { readDataFromFile } = require("../controllers/initial/SaveDataFile");
const sendEmail = require("./sendEmail");

const data = readDataFromFile()


const companyLogo = data?.COMPANY_LOGO;
const companyRegName = data?.COMPANY_REGISTRATION_NAME;
const adminUrl = data?.ADMIN_WEB_URL;
const companyName = data?.COMPANY_NAME;

const sendAdminPassword = ({ name, email, password }) => {
    try {
        sendEmail(
            email,
            `${companyName}'s Admin Credentials`,
            `<span>Dear ${name},</span><br />
            <br />
            <span>Your ${companyName} login details are given below. Please do not share share this to anyone.</span><br />
            <br />
<span>Url - ${adminUrl}</span><br />
<span>Email - ${email}</span><br />
<span>password - ${password}</span><br />
<br />
<span>Please update your password after login.</span><br />
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

module.exports = sendAdminPassword;
