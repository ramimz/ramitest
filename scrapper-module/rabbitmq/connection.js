const amqp = require("amqplib");
const env = require("../config/env.js");

let connection;
let channel;

const QUEUE_URL = `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@localhost:5672`;

async function connectToRabbitMQ(queueName) {
  while (true) {
    try {
      if (!connection) {
        connection = await amqp.connect(QUEUE_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        console.log(`Connected to RabbitMQ, queue: ${queueName}`);
      }
      return channel;
    } catch (error) {
      console.error(
        "Failed to connect to RabbitMQ, retrying in 5 seconds...",
        error
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
    }
  }
}

module.exports = { connectToRabbitMQ };
