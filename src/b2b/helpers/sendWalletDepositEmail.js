const { readDataFromFile } = require("../../controllers/initial/SaveDataFile");
const { sendEmail } = require("../../helpers");
const commonFooter = require("../../helpers/commonFooter");

const data = readDataFromFile()


const sendWalletDeposit = async (reseller, walletDeposit) => {
    try {
        const footerHtml = await commonFooter();

        sendEmail(
            reseller.email,
            "Account Credit Notification",
            `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${
              data?.COMPANY_NAME
          }</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
          <body style="font-family: Arial, sans-serif;">
        <h2 style="text-align: center;">Dear ${reseller.name},</h2>
        <p style="margin: 20px 0;"> We are pleased to inform you that an amount of ${
            walletDeposit?.creditAmount
        }AED has been credited to your B2B account  on ${new Date().toLocaleString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}  ${walletDeposit.paymentProcessor} .
        </p>
        <p>If you have any questions or concerns regarding your order, please do not hesitate to contact us.</p>
        ${footerHtml}
        </body>
      </div>
    </div>
         `
        );
    } catch (err) {
        console.log(err);
    }
};

module.exports = sendWalletDeposit;
