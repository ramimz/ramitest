const { Client } = require('pg');
const env = require("../../config/env");

const client = new Client({
  connectionString: env.DATABASE_URL,
});

client.connect();
client.query('LISTEN product_changes');

client.on('notification', async (msg) => {
    try {
      const payload = JSON.parse(msg.payload);
      console.log(`🛑 Change detected table "product": ${payload.operation}`, payload.id_product);

      if (payload.operation === 'UPDATE' && payload.modified_columns) {
        console.log(`🛑 Modified columns: ${payload.modified_columns.join(', ')}`);
      }
  
    } catch (error) {
      console.error('❌ Error processing notification:', error);
      throw error;
    }
});