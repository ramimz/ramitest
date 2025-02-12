const cron = require('node-cron');
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const brandsApiUrl = 'http://localhost:3003/b';

const updateBrandSales = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${brandsApiUrl}/update-all-sales`);
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

const updateBrandClicks = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${brandsApiUrl}/update-all-clicks`);
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

const updateBrandConversionRate = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${brandsApiUrl}/update-all-conversion-rate`);
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

const updateBrandGender = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${brandsApiUrl}/update-all-gender`);
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
  console.log('🔄 Running scheduled job: Updating brands data...');

  try {
    // Update brands sales
    const salesResponse = await updateBrandSales();
    console.log('Brands update sales completed: ', salesResponse.data)

    // Update brands clicks
    const clicksResponse = await updateBrandClicks();
    console.log('Brands update clicks completed: ', clicksResponse.data)

    // Update brands conversion rate
    const conversionRateResponse = await updateBrandConversionRate();
    console.log('Brands update conversion rate completed: ', conversionRateResponse.data)

    // Update brands gender
    const genderResponse = await updateBrandGender();
    console.log('Product update gender completed: ', genderResponse.data)

    console.log('✅ All Brands updates completed.');
  } catch (error) {
    console.error('❌ Error in scheduled task:', error);
  }
});