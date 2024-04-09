// const html_to_pdf = require("html-pdf-node");
const bwipjs = require("bwip-js");
const qrcode = require("qrcode");
const QRious = require("qrious");
const puppeteer = require("puppeteer");
const { readDataFromFile } = require("../../../../controllers/initial/SaveDataFile");

const data = readDataFromFile()
const createSingleTicketTheme2Pdf = async (activity, ticket) => {
    let combinedHtmlDoc = "";
    let options = {
        format: "A4",
        type: "buffer",
        // generate buffer instead of file
    };

    try {
        async function generatePdfAsBuffer(htmlContent, options) {
            // const browser = await puppeteer.launch();
            let browser = data?.PRODUCTION
                ? await puppeteer.launch({
                      executablePath: "/usr/bin/chromium-browser",
                      args: [
                          "--disable-gpu",
                          "--disable-setuid-sandbox",
                          "--no-sandbox",
                          "--no-zygote",
                      ],
                  })
                : await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(htmlContent);
            const pdfBuffer = await page.pdf(options);
            await browser.close();
            return pdfBuffer;
        }

        const generateBarcodeImage = (content) => {
            return new Promise((resolve, reject) => {
                bwipjs.toBuffer(
                    {
                        bcid: "code128", // Barcode type
                        text: content, // Barcode content
                        scale: 2, // Image scale factor
                        height: 10, // Barcode height in millimeters
                    },
                    function (err, pngBuffer) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(pngBuffer.toString("base64"));
                        }
                    }
                );
            });
        };
        // const generateQRCodeImage = (content) => {
        //     const qr = new QRious({
        //         value: content,
        //         size: 250, // adjust the size as per your requirement
        //     });
        //     return qr.toDataURL();
        // };
        // const generateQRCodeImage = (content) => {
        //     return new Promise((resolve, reject) => {
        //         qrcode.toDataURL(content, (err, pngBuffer) => {
        //             if (err) {
        //                 reject(err);
        //             } else {
        //                 resolve(pngBuffer.toString("base64"));
        //             }
        //         });
        //     });
        // };

        // console.log(activity, ticket, "activity");

        const generateQRCodeImage = async (content) => {
            try {
                const qrCodeDataUrl = await qrcode.toDataURL(content);
                return qrCodeDataUrl;
            } catch (error) {
                console.error(error);
                return null;
            }
        };

        let barcodeImage = await generateBarcodeImage(ticket.ticketNo);
        let qrCodeImage = await generateQRCodeImage(ticket.ticketNo);

        let styles = `
            <style>
            .last__section {
              margin-top: 4px;
          }

          html {
            -webkit-print-color-adjust: exact;
        }
          
          .grid {
              display: grid;
           
          }
          
          .image-wrapper {
              position: relative;
              width: 100%;
              padding-bottom: 100%;
              overflow: hidden;
              
          }
            </style>`;
        let ticketHtmlDoc = `
            <body style="padding-top: 20px; padding: 20px">
            <div
                class="sec-1"
                style="
                    background-color: gray;
                    width: 100%;
                    height: 200px;
                    display: flex;
                "
            >
                <div class="sec-1" style="width: 100%; height: 200px; display: flex">
                    <div
                        style="
                            width: 200px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: rgb(248, 241, 241);
                            position: relative;
                        "
                    >
                    <img style="width: 200px; height: 100px;" src="${data?.SERVER_URL}${
            activity?.attraction?.logo
        }" alt="">
                        <div
                            style="
                                position: absolute;
                                width: 10px;
                                height: 15px;
                                bottom: 0;
                                right: 0;
                                background-color: white;
                                border-radius: 100% 0 0 0;
                            "
                        ></div>
                    </div>
                    <div
                        style="
                            width: 10px;
                            display: flex;
                            justify-content: center;
                            background: repeating-linear-gradient(
                                0deg,
                                white,
                                white 15px,
                                rgb(248, 241, 241) 15px,
                                rgb(248, 241, 241) 30px
                            );
                        "
                    >
                        <p></p>
                    </div>
                    <div
                        style="
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: end;
                            background-color: rgb(248, 241, 241);
                            padding-right: 20px;
                            gap: 10px;
                            position: relative;
                        "
                    >
                        <div
                            style="
                                position: absolute;
                                width: 10px;
                                height: 15px;
                                bottom: 0;
                                left: 0;
                                background-color: white;
                                border-radius: 0 100% 0 0;
                            "
                        ></div>
                        <div style="font-size: large; font-weight: bold">
                        This is your E-Ticket
                        </div>
        
                        <div>This Ticket is Non - Refundable or Non - Transferable</div>
                    </div>
                </div>
            </div>
            <div style="padding: 20px">
            <div
            class="sec-2"
            style="
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 30px;
            "
        >
            <div style="font-size: x-large; font-weight: bold">
                        Tour Name: ${activity?.activity?.name}
                    </div>
                    <div
                    style="
                        border-radius: 80px;
                        border-color: rgb(38, 130, 153);
                        border-width: 15px;
                        border-style: solid;
                        height: 20px;
                        display: flex;
                        height: 250px;
                    "
                >
                    <div
                        style="
                        font-weight: bold;
                            height: 100%;
                            width: 80%;
                            padding-left: 30px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-evenly;
                        "
                    >
                    <p style=" text-transform: capitalize;margin: 0"> Ticket Type : ${
                        activity?.bookingType
                    }</p>
                    <p style=" text-transform: capitalize; margin: 0"> Ticket For : ${
                        ticket?.ticketFor
                    }</p>
                    <p style=" text-transform: capitalize; margin: 0"> Destination : ${
                        activity?.destination?.name
                    }</p>   
                    <p style="text-transform: capitalize; margin: 0"> Valid Till :  ${
                        ticket && ticket.validity
                            ? new Date(ticket.validTill).toLocaleString("default", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "N/A"
                    }</p>
                    <p style=" text-transform: capitalize; margin: 0">Number: ${ticket?.lotNo}</p>

                                                        <p style=" text-transform: capitalize; margin: 0"> Transfer Type : ${
                                                            activity?.transferType
                                                        }</p>
                        </div>
                        <div
                            style="
                                padding: 40px;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                            "
                        >
                            <div >
                                <img
                                    style="width: 150px; height: 150px"
                                    src="${qrCodeImage}"  
                                    alt="Barcode Image"
                                />
                            </div>
                            <div>
                                <p style="font-size: large; font-weight: 500">
                                     ${ticket?.ticketNo}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sec-3" style="display: grid; grid-template-columns: repeat(3, 1fr);  height: 150px; margin: 0 10px; box-sizing: border-box;">
    ${activity?.attraction?.images
        ?.slice(0, 3)
        ?.map((link, index) => {
            return `<img src="${data?.SERVER_URL}${link}" alt="Barcode Image" style="width: 100%; height: 150px; object-fit: cover; box-sizing: border-box;" />`;
        })
        .join("")}
</div>

                <div class="sec-4" style="padding-top: 30px">
                    <div
                        style="
                            font-size: x-large;
                            font-weight: 700;
                            text-decoration: underline;
                        "
                    >
                        Terms & Conditions / Important Information:
                    </div>
                    <div class="desc__section" style="padding-top: 10px; line-height: 12px; font-size: 12px;">
                    ${activity?.activity?.termsAndConditions}
        
                    </div>
                    
                </div>
            </div>
        </body>                      
                `;
        combinedHtmlDoc += ticketHtmlDoc;

        // let file = {
        //     content: combinedHtmlDoc,
        // };
        const pdfBuffer = await generatePdfAsBuffer(combinedHtmlDoc, options);

        // let pdfBuffer = await html_to_pdf.generatePdf(file, options);
        return pdfBuffer;
    } catch (err) {
        throw err;
    }
};

module.exports = createSingleTicketTheme2Pdf;
