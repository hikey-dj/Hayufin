const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const axios = require('axios');
//const { MongoClient, ServerApiVersion } = require('mongodb');

//DOWNLOAD THE MASTER FILE
const downloadMaster = async (url, localZipPath, extractToPath) => {
    try {
    const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
    });

    const writer = fs.createWriteStream(localZipPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    // Use unzipper to extract the contents of the zip file
        const zip = new AdmZip(localZipPath);
        zip.extractAllTo(extractToPath, /*overwrite*/ true);

    // Optional: Remove the downloaded zip file if needed
        fs.unlinkSync(localZipPath);

    console.log('File downloaded and unzipped successfully');
    } catch (error) {
    console.error('Error downloading and unzipping file:', error);
    }
};


//Reading the csv file, data processing
const getData = async () => {
    return new Promise((resolve, reject) => {
        const masterData = [];
        fs.createReadStream('./data/NFO_symbols/NFO_symbols.txt')
            .pipe(csv())
            .on('data', (row) => {
                masterData.push(row);
            })
            .on('end', () => {
                console.log('First 5 rows printed');
                resolve(masterData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });

}

const insertData = async (masterData,client) => {
    const db = client.db('Hayufin'); 
    const collection = db.collection('masterData'); 
  
    try {
      let result = await collection.deleteMany({});
      console.log(`${result.deletedCount} documents deleted`);
      result = await collection.insertMany(masterData);
      console.log(`${result.insertedCount} documents inserted`);
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      console.log('Data inserted');
    }
}

const fetchMaster = async (client) => {
    const masterUrl = "https://api.shoonya.com/NFO_symbols.txt.zip";
    const masterPath = path.join(__dirname, '../data/NFO_symbols.txt.zip');
    const extractPath = path.join(__dirname, '../data/NFO_symbols');

    await downloadMaster(masterUrl, masterPath, extractPath);
    console.log('\nfirst\n');

    const masterData = await getData();
    console.log('\nsecond\n');

    await insertData(masterData,client);
    console.log('\nfourth\n');

};

module.exports = fetchMaster