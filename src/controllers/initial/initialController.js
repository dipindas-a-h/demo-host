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
                COMPANY_LOGO,
                NODE_ENV,
                REDIS_REQUIRED,
                LOGIN_AGENTCODE_REQUIRED,
                NOTIFICATION_KEY,
                OTTILA_BASE_URL,
                OTTILA_USERNAME,
                OTTILA_PASSWORD,
                DATA_FEED,
                FAV_IMAGE,
                COMPANY_SHORT_NAME
                // Add other fields as needed
            } = req.body;

            // Create a new instance of ConfigData model
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
                COMPANY_LOGO,
                NODE_ENV,
                REDIS_REQUIRED,
                LOGIN_AGENTCODE_REQUIRED,
                NOTIFICATION_KEY,
                OTTILA_BASE_URL,
                OTTILA_USERNAME,
                OTTILA_PASSWORD,
                DATA_FEED,
                FAV_IMAGE,
                COMPANY_SHORT_NAME
                // Add other fields as needed
            });
            // console.log('dataa',newConfigData)

            // Save the new config data to the database
            await newConfigData.save();
            // saveDataToFile(newConfigData)
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
            let status = data.length > 0; // Check if data exists

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
            let data = await ConfigData.find({},'COMPANY_SHORT_NAME FAV_IMAGE COMPANY_NAME COMPANY_LOGO');
            let status = data.length > 0; // Check if data exists

            res.status(200).json({
                status: status,
                data: data,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },


    // Delete Initial Data
    deleteInitialData: async (req, res) => {
        try {
            // Retrieve the config ID from request parameters
            const configId = req.params.id;

            // Check if the config ID is valid
            if (!configId) {
                return res.status(400).json({ message: 'Config ID is required' });
            }

            // Find the config data by ID and delete it
            const deletedConfigData = await ConfigData.findByIdAndDelete(configId);

            if (!deletedConfigData) {
                return res.status(404).json({ message: 'Config data not found' });
            }

            // Delete successful
            res.status(200).json({
                message: 'Config data deleted successfully',
                deleted_data: deletedConfigData,
            });

            console.log('Config data deleted successfully');
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    
  // Clear All Initial Data
  clearInitialData: async (req, res) => {
    try {
        // Delete all documents in the ConfigData collection
        await ConfigData.deleteMany({});

        res.status(200).json({
            message: 'All initial data cleared successfully',
        });

        console.log('All initial data cleared successfully');
    } catch (err) {
        sendErrorResponse(res, 500, err);
    }
},

updateInitialData: async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Config ID is required' });
        }


        const updatedConfigData = await ConfigData.findByIdAndUpdate(id, updatedData, { new: true });
        writeDataToFile(updatedConfigData);

        if (!updatedConfigData) {
            return res.status(404).json({ message: 'Config data not found' });
        }

        // Update successful
        res.status(200).json({
            message: 'Config data updated successfully',
            updated_data: updatedConfigData,
        });

        console.log('Config data updated successfully');
    } catch (err) {
        sendErrorResponse(res, 500, err);
    }
},   
    

    
};
