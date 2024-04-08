const nodemailer = require("nodemailer");
const { readDataFromFile } = require("../../controllers/initial/SaveDataFile");

const sendEmail = async ({ senderEmail, senderPassword, subject, html, mailList }) => {
    try {
        const data = readDataFromFile
        const transporter = nodemailer.createTransport({
            host: "smtp.travellerschoice.ae",
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: data?.EMAIL,
                pass: data?.PASSWORD,
            },
        });

        await transporter.sendMail({
            from: senderEmail,
            to: mailList,
            subject: `${data?.COMPANY_NAME} - ${subject}`,
            html,
        });

        console.log("email has been sent");
    } catch (error) {
        console.log(error);
        console.log("E-mail not sent");
    }
};

module.exports = sendEmail;
