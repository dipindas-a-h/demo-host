const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.json');

// Function to read data from JSON file
const readDataFromFile = () => {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading data from file:', error);
        return null;
    }
};

// Function to write data to JSON file
const writeDataToFile = (data) => {
    try {
        const jsonData = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonData);
        console.log('Data saved to file successfully');
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
};

module.exports = {
    readDataFromFile,
    writeDataToFile
};
