const { sendErrorResponse } = require("../../helpers");
const ConfigData = require("../../models/initial/config.model");
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
            } = req.body;
            const companyLogoPath = req.files["COMPANY_LOGO"]
                ? req.files["COMPANY_LOGO"][0].path
                : null;
            const favImagePath = req.files["FAV_IMAGE"]
                ? req.files["FAV_IMAGE"][0].path
                : null;


                if(!companyLogoPath){
                    return res.status(400).json({ message: `Required fields are missing: COMPANY_LOGO`});

                }else if(!favImagePath){
                    return res.status(400).json({ message: `Required fields are missing: FAV_IMAGE`});

                }else if(!COMPANY_NAME){
                    return res.status(400).json({ message: `Required fields are missing: COMPANY_NAME`});

                }else if(!COMPANY_SHORT_NAME){ 
                    return res.status(400).json({ message: `Required fields are missing: COMPANY_SHORT_NAME`});

                }

            const newConfigData = new ConfigData({
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
            sendErrorResponse(res, 500, err);
        }
    },

    getInitialData: async (req, res) => {
        try {
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

    getCompanyData: async (req, res) => {
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
            const configId = req.params.id; // Assuming you're passing the config ID in the URL parameter
            const updateFields = req.body;
    
            // Check if the config data exists
            const configData = await ConfigData.findById(configId);
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
    }
};
