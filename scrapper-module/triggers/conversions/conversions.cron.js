const cron = require('node-cron');
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const conversionsApiUrl = 'http://localhost:3003/c';

const updateConversionIdProduct = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${conversionsApiUrl}/update-all-id-product`);
        return response;
      } catch (error) {
        attempt++;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
  
        if (attempt >= retries) {
          throw new Error('Max retries reached');
        }
  
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        wait(RETRY_DELAY); // Wait before trying again
      }
    }
};

const updateConversionSeason = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${conversionsApiUrl}/update-all-season`);
        return response;
      } catch (error) {
        attempt++;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
  
        if (attempt >= retries) {
          throw new Error('Max retries reached');
        }
  
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        wait(RETRY_DELAY); // Wait before trying again
      }
    }
};

cron.schedule('* * * * *', async () => {
  console.log('🔄 Running scheduled job: Updating conversions data...');

  try {
    // Update conversions idProducts
    const idProductsResponse = await updateConversionIdProduct();
    console.log('Conversions update idProducts completed: ', idProductsResponse.data)

    // Update conversions season
    const seasonResponse = await updateConversionSeason();
    console.log('Conversions update season completed: ', seasonResponse.data)

    console.log('✅ All conversions updates completed.');
  } catch (error) {
    console.error('❌ Error in scheduled task:', error);
  }
});