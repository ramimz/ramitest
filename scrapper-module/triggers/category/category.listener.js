const { Client } = require('pg');
const env = require("../../config/env");
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const client = new Client({
  connectionString: env.DATABASE_URL,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const productApiUrl = 'http://localhost:3003/p';
const influencersApiUrl = 'http://localhost:3003/i';

client.connect();
client.query('LISTEN category_changes');

const updateProductCategory = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        // const response = await axios.put(`${productApiUrl}/update-all-gender`);
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

const updateInfluencerKpis = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const firstResponse = await axios.put(`${influencersApiUrl}/update-all-sales_kpi`);
        const secondResponse = await axios.put(`${influencersApiUrl}/update-all-second-kpi`);
        return {
            ...firstResponse,
            ...secondResponse,
        };
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

client.on('notification', async (msg) => {
    try {
      const payload = JSON.parse(msg.payload);
      console.log(`🛑 Change detected table ${payload.table}: ${payload.operation}`, payload.id);

      if(payload.operation === 'INSERT'){
        // Update products categories and subcategories
        const categoryResponse = await updateProductCategory();
        console.log('Products update categories and subcategories completed: ', categoryResponse.data)

        // Update influencers kpis
        const kpisResponse = await updateInfluencerKpis();
        console.log('Influencers update kpis completed: ', kpisResponse.data)
      }

      if (payload.operation === 'UPDATE' && payload.modified_columns) {
        console.log(`🛑 Modified columns: ${payload.modified_columns.join(', ')}`);

        if(payload.table === 'category' && payload.modified_columns.includes('category_name')){
            // TODO: Update products categories and subcategories
            // TODO: Update influencers kpis
        }

        if(payload.table === 'subcategory'){
            // TODO: Update products categories and subcategories
            // TODO: Update influencers kpis
        }

      }

      if (payload.operation === 'DELETE') {
        client.query(`DELETE FROM  WHERE infs_categ_kpis WHERE ${payload.table} = ${payload.id}`);
      }
  
    } catch (error) {
      console.error('❌ Error processing notification:', error);
      throw error;
    }
});