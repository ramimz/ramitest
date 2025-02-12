const cron = require('node-cron');
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const clicksApiUrl = 'http://localhost:3003/cl';

const updateClickIdProduct = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${clicksApiUrl}/update-all-id-product`);
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
  console.log('🔄 Running scheduled job: Updating clicks data...');

  try {
    // Update clicks idProducts
    const idProductsResponse = await updateClickIdProduct();
    console.log('Clicks update idProducts completed: ', idProductsResponse.data)

    console.log('✅ All Clicks updates completed.');
  } catch (error) {
    console.error('❌ Error in scheduled task:', error);
  }
});