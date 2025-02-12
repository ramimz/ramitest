const { Client } = require('pg');
const env = require("../../config/env");
const axios = require("axios");
const { wait } = require("../../utils/utils.js");

const client = new Client({
  connectionString: env.DATABASE_URL,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const influencersApiUrl = 'http://localhost:3003/i';

client.connect();
client.query('LISTEN influencers_changes');

const updateInfluencerGender = async (retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${influencersApiUrl}/update-all-gender`);
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

const updateInfluencerKpis = async (uid, retries = MAX_RETRIES) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axios.put(`${influencersApiUrl}/univers-infs-themes-kpi/${uid}`);
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

client.on('notification', async (msg) => {
    try {
      const payload = JSON.parse(msg.payload);
      console.log(`🛑 Change detected table ${payload.table}: ${payload.operation}`, payload.uid);

      if(payload.operation === 'INSERT'){
        // Update influencers gender
        const genderResponse = await updateInfluencerGender();
        console.log('Influencers update gender completed: ', genderResponse.data)

        // Update influence_themes and univers kpis
        const kpisResponse = await updateInfluencerKpis(payload.uid);
        console.log('Influencers update kpis completed: ', kpisResponse.data)
      }

      if (payload.operation === 'UPDATE' && payload.modified_columns) {
        console.log(`🛑 Modified columns: ${payload.modified_columns.join(', ')}`);

        if(payload.modified_columns.includes('civility')){
            // Update influencers gender
            const genderResponse = await updateInfluencerGender();
            console.log('Influencers update gender completed: ', genderResponse.data)
        }

      }
  
    } catch (error) {
      console.error('❌ Error processing notification:', error);
      throw error;
    }
});