const cron = require('node-cron');
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const productsApiUrl = 'http://localhost:3003/p';

const updateProductSales = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${productsApiUrl}/update-all-sales`);
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

const updateProductClicks = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${productsApiUrl}/update-all-clicks`);
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

const updateProductConversionRate = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${productsApiUrl}/update-all-conversion-rate`);
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

const updateProductSeason = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${productsApiUrl}/update-all-season`);
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

const updateProductImage = async (retries = MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.put(`${productsApiUrl}/update-all-images`);
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

// Define the cron job (every day at midnight)
cron.schedule('* * * * *', async () => {
  console.log('🔄 Running scheduled job: Updating product data...');

  try {
    // Update product sales
    const salesResponse = await updateProductSales();
    console.log('Product update sales completed: ', salesResponse.data)

    // Update product clicks
    const clicksResponse = await updateProductClicks();
    console.log('Product update clicks completed: ', clicksResponse.data)

    // Update product conversion rate
    const conversionRateResponse = await updateProductConversionRate();
    console.log('Product update conversion rate completed: ', conversionRateResponse.data)

    // Update product season
    const seasonResponse = await updateProductSeason();
    console.log('Product update season completed: ', seasonResponse.data)

    // Update product image
    const imageResponse = await updateProductImage();
    console.log('Product update image completed: ', imageResponse.data)

    // TODO: Update product categ and subcateg

    console.log('✅ All Product updates completed.');
  } catch (error) {
    console.error('❌ Error in scheduled task:', error);
  }
});