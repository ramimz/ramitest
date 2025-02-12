const { connectToRabbitMQ } = require("./connection");

async function sendToQueue(queueName, message) {
  const channel = await connectToRabbitMQ(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`Message sent to queue ${queueName}:`, message);
}

module.exports = { sendToQueue };
