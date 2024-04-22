const { sendErrorResponse } = require("../../helpers");
const addNewAdminHelper = require("../../helpers/initial/initialHelper");
const ConfigData = require("../../models/initial/config.model");
const Test = require("../../models/test.model");
const { saveDataToFile, writeDataToFile, readDataFromFile } = require("./SaveDataFile");

module.exports = {
    createInitialData: async (req, res) => {
        try {
            const {
                PRODUCTION,
                JWT_SECRET,
                PAYPAL_CLIENT_ID,
                PAYPAL_CLIENT_SECRET,
                EMAIL,
                PASSWORD,
                CCAVENUE_MERCHANT_ID,
                CCAVENUE_ACCESS_CODE,
                CCAVENUE_WORKING_KEY,
                RAZORPAY_KEY_ID,
                RAZORPAY_KEY_SECRET,
                SERVER_URL,
                REACT_APP_URL,
                B2B_WEB_URL,
                ADMIN_WEB_URL,
                BURJ_KHALIFA_USERNAME,
                BURJ_KHALIFA_PASSWORD,
                INSURANCE_SERVER_URL,
                WHATSAPP_SERVER_URL,
                CYGNET_USERNAME,
                CYGNET_PASSWORD,
                CYGNET_TENANT,
                CYGNET_AGENCY,
                HOTEL_BEDS_URL,
                HOTEL_BEDS_API_KEY,
                HOTEL_BEDS_SECRET,
                FLIGHT_SERVER_URL,
                COMPANY_NAME,
                COMPANY_REGISTRATION_NAME,
                NODE_ENV,
                REDIS_REQUIRED,
                LOGIN_AGENTCODE_REQUIRED,
                NOTIFICATION_KEY,
                OTTILA_BASE_URL,
                OTTILA_USERNAME,
                OTTILA_PASSWORD,
                DATA_FEED,
                COMPANY_SHORT_NAME,
                NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                CLOUDINARY_API_KEY,
                CLOUDINARY_API_SECRET,
                CLOUDINARY_FOLDER,
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                NEXTAUTH_SECRET,
                NEXTAUTH_URL,
                NEXT_PUBLIC_GOOGLE_ANALYTIC_ID,
                NEXT_PUBLIC_TABBY_PUBLIC_KEY,
                NEXT_PUBLIC_TABBY_MERCHANT_CODE,
                NEXT_PUBLIC_TOURS_URL,
                NEXT_PUBLIC_SERVER_URL,
                NEXT_PUBLIC_CLIENT_URL,
                NEXT_PUBLIC_CDN_URL,
                NEXT_PUBLIC_TITLE_NAME,
                NEXT_PUBLIC_TITLE_SHORT_NAME,
                NEXT_PUBLIC_TITLE_SHORT_CODE,
                
                NEXT_PUBLIC_PLAYSTORE_URL,
                NEXT_PUBLIC_COMPANYADDRESS1,
                NEXT_PUBLIC_COMPANYADDRESS2,
                B2B_SERVER_URL,
                B2B_CLIENT_URL,
                B2B_MAP_API_KEY,
                B2B_TITLE_NAME,
                B2B_TITLE_SHORT_NAME,
                B2B_COMPANY_SHORT_CODE,
                B2B_COMPANY_B2B_URL,
                B2B_COMPANY_EMAIL,
                B2B_FACEBOOK_URL,
                B2B_INSTAGRAM_URL,
                B2B_PLAYSTORE_URL,
                B2B_COMPANY_CONTACT_NUMBER_ONE,
                B2B_COMPANY_CONTACT_NUMBER_TWO,
                B2B_COMPANY_WHATSAPP_NUMBER,
                
                B2B_IS_API_INTEGRATED,
                B2B_API_INTEGRATION_URL,
                B2B_CONTACTUS_EMAIL,
                B2B_ENQUIRY_EMAIL,
                B2B_COMPANY_ADDRESS,
                B2B_COMPANY_CITY,
                B2B_COMPANY_PINCODE,
                B2B_COMAPNY_COUNTRY,
            } = req.body;
            const companyLogoPath = req.files["COMPANY_LOGO"]
                ? req.files["COMPANY_LOGO"][0].path
                : null;
            const favImagePath = req.files["FAV_IMAGE"] ? req.files["FAV_IMAGE"][0].path : null;
            const nextPublicCompanyLogoPath = req.files["NEXT_PUBLIC_COMPANY_LOGO"]
                ? req.files["NEXT_PUBLIC_COMPANY_LOGO"][0].path
                : null;
            const nextPublicCompanyFavIconPath = req.files["NEXT_PUBLIC_COMPANY_FAVICON"]
                ? req.files["NEXT_PUBLIC_COMPANY_FAVICON"][0].path
                : null;
            const nextPublicBannerImagePath = req.files["NEXT_PUBLIC_BANNER_IMAGE"]
                ? req.files["NEXT_PUBLIC_BANNER_IMAGE"][0].path
                : null;
            const nextPublicBannerVideoPath = req.files["NEXT_PUBLIC_BANNER_VIDEO"]
                ? req.files["NEXT_PUBLIC_BANNER_VIDEO"][0].path
                : null;
            const nextPublicBannerVideoMobilePath = req.files["NEXT_PUBLIC_BANNER_VIDEO_MOBILE"]
                ? req.files["NEXT_PUBLIC_BANNER_VIDEO_MOBILE"][0].path
                : null;
            const nextPublicBannerImageMobilePath = req.files["NEXT_PUBLIC_BANNER_IMAGE_MOBILE"]
                ? req.files["NEXT_PUBLIC_BANNER_IMAGE_MOBILE"][0].path
                : null;
            const nextPublicMobileAppImagePath = req.files["NEXT_PUBLIC_MOBILE_APP_IMAGE"]
                ? req.files["NEXT_PUBLIC_MOBILE_APP_IMAGE"][0].path
                : null;
            const b2bMobileAppImagePath = req.files["B2B_MOBILE_APP_IMAGE"]
                ? req.files["B2B_MOBILE_APP_IMAGE"][0].path
                : null;
            const b2bCompanyLogoPath = req.files["B2B_COMPANY_LOGO"]
                ? req.files["B2B_COMPANY_LOGO"][0].path
                : null;
            const b2bCompanyFavIconPath = req.files["B2B_COMPANY_FAVICON"]
                ? req.files["B2B_COMPANY_FAVICON"][0].path
                : null;
            const b2bLoginBannerPath = req.files["B2B_LOGIN_BANNER"]
                ? req.files["B2B_LOGIN_BANNER"][0].path
                : null;
            const b2bSignUpBannerPath = req.files["B2B_SIGNUP_BANNER"]
                ? req.files["B2B_SIGNUP_BANNER"][0].path
                : null;

            if (!companyLogoPath) {
                return res
                    .status(400)
                    .json({ message: `Required fields are missing: COMPANY_LOGO` });
            } else if (!favImagePath) {
                return res.status(400).json({ message: `Required fields are missing: FAV_IMAGE` });
            } else if (!COMPANY_NAME) {
                return res
                    .status(400)
                    .json({ message: `Required fields are missing: COMPANY_NAME` });
            } else if (!COMPANY_SHORT_NAME) {
                return res
                    .status(400)
                    .json({ message: `Required fields are missing: COMPANY_SHORT_NAME` });
            }

            const existingConfig = await ConfigData.find({});

            if (existingConfig?.length) {
                // return res.status(400).json({
                //     message: `Configuration data is already exists`,
                // });
                return sendErrorResponse(res, 400, "Configuration data is already exists");
            }

            const adminData = {
                name: "superadmin",
                    email: "superadmin@gmail.com",
                    phoneNumber: "1234567890",
                    designation: "Admin",
                    joinedDate: "2024-04-22",
                    city: "City",
                    country: "AE",
                    description: "Description",
            }
        //   const addAdminData =   
          addNewAdminHelper(adminData)
          .then(admin => {
            console.log("New admin created:", admin);
        })
        .catch(error => {
            console.error("Error creating new admin:", error.message);
        });
        // console.log('dataaaa',addAdminData)


            const newConfigData = new ConfigData({
                PRODUCTION,
                JWT_SECRET: "2b53d4c4deea138f57a772b9f4d0e24a",
                PAYPAL_CLIENT_ID,
                PAYPAL_CLIENT_SECRET,
                EMAIL,
                PASSWORD,
                CCAVENUE_MERCHANT_ID,
                CCAVENUE_ACCESS_CODE,
                CCAVENUE_WORKING_KEY,
                RAZORPAY_KEY_ID,
                RAZORPAY_KEY_SECRET,
                SERVER_URL,
                REACT_APP_URL,
                B2B_WEB_URL,
                ADMIN_WEB_URL,
                BURJ_KHALIFA_USERNAME,
                BURJ_KHALIFA_PASSWORD,
                INSURANCE_SERVER_URL,
                WHATSAPP_SERVER_URL,
                CYGNET_USERNAME,
                CYGNET_PASSWORD,
                CYGNET_TENANT,
                CYGNET_AGENCY,
                HOTEL_BEDS_URL,
                HOTEL_BEDS_API_KEY,
                HOTEL_BEDS_SECRET,
                FLIGHT_SERVER_URL,
                COMPANY_NAME,
                COMPANY_REGISTRATION_NAME,
                COMPANY_LOGO: companyLogoPath,
                NODE_ENV,
                REDIS_REQUIRED,
                LOGIN_AGENTCODE_REQUIRED,
                NOTIFICATION_KEY,
                OTTILA_BASE_URL,
                OTTILA_USERNAME,
                OTTILA_PASSWORD,
                DATA_FEED,
                FAV_IMAGE: favImagePath,
                COMPANY_SHORT_NAME,
                CHECK: 1,
                NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                CLOUDINARY_API_KEY,
                CLOUDINARY_API_SECRET,
                CLOUDINARY_FOLDER,
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                NEXTAUTH_SECRET,
                NEXTAUTH_URL,
                NEXT_PUBLIC_GOOGLE_ANALYTIC_ID,
                NEXT_PUBLIC_TABBY_PUBLIC_KEY,
                NEXT_PUBLIC_TABBY_MERCHANT_CODE,
                NEXT_PUBLIC_TOURS_URL,
                NEXT_PUBLIC_SERVER_URL,
                NEXT_PUBLIC_CLIENT_URL,
                NEXT_PUBLIC_CDN_URL,
                NEXT_PUBLIC_TITLE_NAME,
                NEXT_PUBLIC_TITLE_SHORT_NAME,
                NEXT_PUBLIC_TITLE_SHORT_CODE,
                NEXT_PUBLIC_COMPANY_LOGO: nextPublicCompanyLogoPath,
                NEXT_PUBLIC_COMPANY_FAVICON: nextPublicCompanyFavIconPath,
                NEXT_PUBLIC_BANNER_IMAGE: nextPublicBannerImagePath,
                NEXT_PUBLIC_BANNER_VIDEO: nextPublicBannerVideoPath,
                NEXT_PUBLIC_BANNER_VIDEO_MOBILE: nextPublicBannerVideoMobilePath,
                NEXT_PUBLIC_BANNER_IMAGE_MOBILE: nextPublicBannerImageMobilePath,
                NEXT_PUBLIC_MOBILE_APP_IMAGE: nextPublicMobileAppImagePath,
                NEXT_PUBLIC_PLAYSTORE_URL,
                NEXT_PUBLIC_COMPANYADDRESS1,
                NEXT_PUBLIC_COMPANYADDRESS2,
                B2B_SERVER_URL,
                B2B_CLIENT_URL,
                B2B_MAP_API_KEY,
                B2B_TITLE_NAME,
                B2B_TITLE_SHORT_NAME,
                B2B_COMPANY_SHORT_CODE,
                B2B_COMPANY_B2B_URL,
                B2B_COMPANY_EMAIL,
                B2B_FACEBOOK_URL,
                B2B_INSTAGRAM_URL,
                B2B_MOBILE_APP_IMAGE: b2bMobileAppImagePath,
                B2B_PLAYSTORE_URL,
                B2B_COMPANY_CONTACT_NUMBER_ONE,
                B2B_COMPANY_CONTACT_NUMBER_TWO,
                B2B_COMPANY_WHATSAPP_NUMBER,
                B2B_COMPANY_LOGO: b2bCompanyLogoPath,
                B2B_COMPANY_FAVICON: b2bCompanyFavIconPath,
                B2B_LOGIN_BANNER: b2bLoginBannerPath,
                B2B_SIGNUP_BANNER: b2bSignUpBannerPath,
                B2B_IS_API_INTEGRATED,
                B2B_API_INTEGRATION_URL,
                B2B_CONTACTUS_EMAIL,
                B2B_ENQUIRY_EMAIL,
                B2B_COMPANY_ADDRESS,
                B2B_COMPANY_CITY,
                B2B_COMPANY_PINCODE,
                B2B_COMAPNY_COUNTRY,
            });

            await newConfigData.save();
            writeDataToFile(newConfigData);
            res.status(201).json({
                message: "Configuration Created",
                config_id: newConfigData?._id,
                config_data: newConfigData,
            });

            let data = readDataFromFile();

            console.log(data?.JWT_SECRET);
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getInitialData: async (req, res) => {
        try {
            let data = await ConfigData.find(
                {},
                "COMPANY_SHORT_NAME FAV_IMAGE COMPANY_NAME COMPANY_LOGO"
            );
            let status = data.length > 0;

            res.status(200).json({
                status: status,
                data: data,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getCompanyData: async (req, res) => {
        try {
            // let data = await ConfigData.find(
            //     {},
            //     "COMPANY_SHORT_NAME FAV_IMAGE COMPANY_NAME COMPANY_LOGO"
            // );
            let data = await ConfigData.find({});
            let status = data.length > 0;

            res.status(200).json({
                status: status,
                data: data,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getRequiredData: async (req, res) => {
        try {
            let data = await ConfigData.find(
                {},
                " NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET CLOUDINARY_FOLDER GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET NEXTAUTH_SECRET NEXTAUTH_URL NEXT_PUBLIC_GOOGLE_ANALYTIC_ID NEXT_PUBLIC_TABBY_PUBLIC_KEY NEXT_PUBLIC_TABBY_MERCHANT_CODE NEXT_PUBLIC_TOURS_URL NEXT_PUBLIC_SERVER_URL NEXT_PUBLIC_CLIENT_URL NEXT_PUBLIC_CDN_URL NEXT_PUBLIC_TITLE_NAME NEXT_PUBLIC_TITLE_SHORT_NAME NEXT_PUBLIC_TITLE_SHORT_CODE NEXT_PUBLIC_COMPANY_LOGO NEXT_PUBLIC_COMPANY_FAVICON NEXT_PUBLIC_BANNER_IMAGE NEXT_PUBLIC_BANNER_VIDEO NEXT_PUBLIC_BANNER_VIDEO_MOBILE NEXT_PUBLIC_BANNER_IMAGE_MOBILE NEXT_PUBLIC_MOBILE_APP_iMAGE NEXT_PUBLIC_PLAYSTORE_URL NEXT_PUBLIC_COMPANYADDRESS1 NEXT_PUBLIC_COMPANYADDRESS2 "
            );

            let status = data.length > 0;

            // Transforming array to object
            let transformedData = data.length > 0 ? data[0] : {};

            res.status(200).json({
                status: status,
                data: transformedData,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getB2BData: async (req, res) => {
        try {
            let data = await ConfigData.find(
                {},
                "  B2B_SERVER_URL B2B_CLIENT_URL B2B_MAP_API_KEY B2B_TITLE_NAME B2B_TITLE_SHORT_NAME B2B_COMPANY_SHORT_CODE B2B_COMPANY_B2B_URL B2B_COMPANY_EMAIL B2B_FACEBOOK_URL B2B_INSTAGRAM_URL B2B_MOBILE_APP_IMAGE B2B_PLAYSTORE_URL B2B_COMPANY_CONTACT_NUMBER_ONE B2B_COMPANY_CONTACT_NUMBER_TWO B2B_COMPANY_WHATSAPP_NUMBER B2B_COMPANY_LOGO B2B_COMPANY_FAVICON B2B_LOGIN_BANNER B2B_SIGNUP_BANNER B2B_IS_API_INTEGRATED B2B_API_INTEGRATION_URL B2B_CONTACTUS_EMAIL B2B_ENQUIRY_EMAIL B2B_COMPANY_ADDRESS B2B_COMPANY_CITY B2B_COMPANY_PINCODE B2B_COMAPNY_COUNTRY"
            );
            let status = data.length > 0;

            res.status(200).json({
                status: status,
                data: data[0],
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteInitialData: async (req, res) => {
        try {
            const configId = req.params.id;

            if (!configId) {
                return res.status(400).json({ message: "Config ID is required" });
            }

            const deletedConfigData = await ConfigData.findByIdAndDelete(configId);

            if (!deletedConfigData) {
                return res.status(404).json({ message: "Config data not found" });
            }

            res.status(200).json({
                message: "Config data deleted successfully",
                deleted_data: deletedConfigData,
            });

            console.log("Config data deleted successfully");
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    clearInitialData: async (req, res) => {
        try {
            await ConfigData.deleteMany({});

            res.status(200).json({
                message: "All initial data cleared successfully",
            });

            console.log("All initial data cleared successfully");
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateInitialData: async (req, res) => {
        try {
            // const configId = req.params.id; // Assuming you're passing the config ID in the URL parameter
            const updateFields = req.body;

            // Check if the config data exists
            const configData = await ConfigData.findOne({ CHECK: 1 });
            if (!configData) {
                return res.status(404).json({ message: "Configuration not found" });
            }

            // Update the config data fields
            for (const key in updateFields) {
                if (Object.hasOwnProperty.call(updateFields, key)) {
                    configData[key] = updateFields[key];
                }
            }

            // Handle file uploads if any
            if (req.files) {
                if (req.files["COMPANY_LOGO"]) {
                    configData.COMPANY_LOGO = req.files["COMPANY_LOGO"][0].path;
                }
                if (req.files["FAV_IMAGE"]) {
                    configData.FAV_IMAGE = req.files["FAV_IMAGE"][0].path;
                }
                if (req.files["NEXT_PUBLIC_COMPANY_LOGO"]) {
                    configData.NEXT_PUBLIC_COMPANY_LOGO =
                        req.files["NEXT_PUBLIC_COMPANY_LOGO"][0].path;
                }
                if (req.files["NEXT_PUBLIC_COMPANY_FAVICON"]) {
                    configData.NEXT_PUBLIC_COMPANY_FAVICON =
                        req.files["NEXT_PUBLIC_COMPANY_FAVICON"][0].path;
                }
                if (req.files["NEXT_PUBLIC_BANNER_IMAGE"]) {
                    configData.NEXT_PUBLIC_BANNER_IMAGE =
                        req.files["NEXT_PUBLIC_BANNER_IMAGE"][0].path;
                }
                if (req.files["NEXT_PUBLIC_BANNER_VIDEO"]) {
                    configData.NEXT_PUBLIC_BANNER_VIDEO =
                        req.files["NEXT_PUBLIC_BANNER_VIDEO"][0].path;
                }
                if (req.files["NEXT_PUBLIC_BANNER_VIDEO_MOBILE"]) {
                    configData.NEXT_PUBLIC_BANNER_VIDEO_MOBILE =
                        req.files["NEXT_PUBLIC_BANNER_VIDEO_MOBILE"][0].path;
                }
                if (req.files["NEXT_PUBLIC_BANNER_IMAGE_MOBILE"]) {
                    configData.NEXT_PUBLIC_BANNER_IMAGE_MOBILE =
                        req.files["NEXT_PUBLIC_BANNER_IMAGE_MOBILE"][0].path;
                }
                if (req.files["NEXT_PUBLIC_MOBILE_APP_IMAGE"]) {
                    configData.NEXT_PUBLIC_MOBILE_APP_IMAGE =
                        req.files["NEXT_PUBLIC_MOBILE_APP_IMAGE"][0].path;
                }
                if (req.files["B2B_MOBILE_APP_IMAGE"]) {
                    configData.B2B_MOBILE_APP_IMAGE = req.files["B2B_MOBILE_APP_IMAGE"][0].path;
                }
                if (req.files["B2B_COMPANY_LOGO"]) {
                    configData.B2B_COMPANY_LOGO = req.files["B2B_COMPANY_LOGO"][0].path;
                }
                if (req.files["B2B_COMPANY_FAVICON"]) {
                    configData.B2B_COMPANY_FAVICON = req.files["B2B_COMPANY_FAVICON"][0].path;
                }
                if (req.files["B2B_LOGIN_BANNER"]) {
                    configData.B2B_LOGIN_BANNER = req.files["B2B_LOGIN_BANNER"][0].path;
                }
                if (req.files["B2B_SIGNUP_BANNER"]) {
                    configData.B2B_SIGNUP_BANNER = req.files["B2B_SIGNUP_BANNER"][0].path;
                }
            }

            // Save the updated config data
            await configData.save();
            writeDataToFile(configData);

            res.status(200).json({
                message: "Configuration updated",
                config_data: configData,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    testData: async (req, res) => {
        try {
            const { name, email } = req?.body;
            const dta = new Test({
                name,
                email,
            });

            await dta.save();
            console.log(dta);
            res.status(201).json({
                message: "test Created",
                data: dta,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },
};
