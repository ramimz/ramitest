const { processArticleMessage, processScrapperMessage } = require("./handler.js");
const { PRODUCTS_QUEUE, BATCH_SIZE, DELAY_TIME, SCRAPPER_QUEUE } = require("../utils/constants.js");
const { connectToRabbitMQ } = require("./connection.js");
const env = require("../config/env.js");

const DAILY_LIMIT = 1500; // Default daily message processing limit

// Shared object to track daily consumption for each queue
const dailyCounters = {};
const resetTimes = {}; // Stores the reset time for each queue
const limitReachedFlags = {}; // Keeps track if the daily limit message has been displayed
let apiKeysFinished = false;
const isQueueEmptyMessageShown = {};

// Global array of API keys
const apiKeys = env.GEMINI_API_KEYS ? env.GEMINI_API_KEYS.split(',') : [];
let currentApiKeyIndex = 0; // Tracks the current API key index

// Function to switch to the next API key
const switchApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  console.log("Switched API Key:", apiKeys[currentApiKeyIndex]);
  if(currentApiKeyIndex === 0){
    apiKeysFinished = true;
  }
};

// Utility function to calculate the next reset time
const getNextResetTime = (firstConsumptionTime) => {
  const nextReset = new Date(firstConsumptionTime);
  nextReset.setDate(nextReset.getDate() + 1); // Schedule for the same time the next day
  return nextReset;
};

// Function to reset counters for a specific queue
const resetDailyCounter = (queueName) => {
  dailyCounters[queueName] = 0;
  limitReachedFlags[queueName] = false; // Reset the flag for the daily limit message
  apiKeysFinished = false;
  console.log(`${queueName}: Daily counter has been reset.`);
};

// Function to schedule the reset for a specific queue
const scheduleReset = (queueName, resetTime) => {
  const now = new Date();
  const timeUntilReset = resetTime - now;

  console.log(`${queueName}: Reset scheduled in ${timeUntilReset / 1000 / 60} minutes.`);

  setTimeout(() => {
    resetDailyCounter(queueName);

    // Schedule the next reset for the following day
    resetTimes[queueName] = getNextResetTime(resetTime);
    scheduleReset(queueName, resetTimes[queueName]);
  }, timeUntilReset);
};

// Utility function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic function to consume messages from a RabbitMQ queue
 * @param {string} queueName - The name of the queue to consume from
 * @param {Function} processMessage - Function to process the messages
 * @param {Object} options - Processing options
 */
const consumeFromQueue = async (queueName, processMessage, options = {}) => {
  const isProductsQueue = queueName === PRODUCTS_QUEUE;
  const isScrapperQueue = queueName === SCRAPPER_QUEUE;
  const {
    batchSize = BATCH_SIZE, // Number of messages to process in each batch
    delayTime = DELAY_TIME, // Delay time (in ms) between processing batches
    dailyLimit = isProductsQueue ? DAILY_LIMIT : null, // Maximum number of messages to process per day
  } = options;

  // Initialize the counter for this queue if not already set
  if (!(queueName in dailyCounters) && !isScrapperQueue) {
    dailyCounters[queueName] = 0;
  }

  const channel = await connectToRabbitMQ(queueName); // Connect to RabbitMQ
  console.log(queueName, ": Connected to RabbitMQ and listening for messages...");

  channel.prefetch(batchSize); // Set prefetch limit to batchSize

  const messagesToProcess = [];
  if (!(queueName in isQueueEmptyMessageShown)) {
    isQueueEmptyMessageShown[queueName] = false;
  }

  // Start consuming messages and push them to the processing queue
  channel.consume(queueName, (msg) => {
    if (msg) {
      try{
        messagesToProcess.push(msg);

        console.log(`${queueName} : Received message with tag: ${msg.fields.deliveryTag}`);
        isQueueEmptyMessageShown[queueName] = false; // Reset the flag when a message arrives

        // If it's the first consumption of the day, schedule the reset
        if (!resetTimes[queueName] && !isScrapperQueue) {
          const firstConsumptionTime = new Date();
          resetTimes[queueName] = getNextResetTime(firstConsumptionTime);
          scheduleReset(queueName, resetTimes[queueName]);
        }
      }
      catch(error){
        console.error(queueName, "Error processing message:", error.message);
        channel.nack(msg, false, true); // Requeue the message
        console.log(queueName, "Nacked message:", msg.fields.deliveryTag);
      }
    }
  });

  // Main loop to process messages
  while (true) {
    const canProcessProductsQueue = isProductsQueue && dailyCounters[queueName] + batchSize <= dailyLimit;

    if ((canProcessProductsQueue || isScrapperQueue) && messagesToProcess.length > 0) {
      const messagesInBatch = messagesToProcess.splice(0, batchSize);

      try {
        await Promise.all(
          messagesInBatch.map(async (msg) => {
            const content = JSON.parse(msg.content.toString());
            if (isProductsQueue) content.api_key = apiKeys[currentApiKeyIndex];
            await processMessage(content); // Process the message
            channel.ack(msg); // Acknowledge the message
            console.log(queueName, ": Acknowledged message:", msg.fields.deliveryTag);
          })
        );

        if (isProductsQueue) dailyCounters[queueName] += messagesInBatch.length;
        console.log(queueName, `: Processed ${messagesInBatch.length} messages.`);
        console.log(queueName, `: Daily counter: ${dailyCounters[queueName]} messages.`);

        // Introduce a delay after processing the batch
        console.log(queueName, `: Waiting ${delayTime / 1000} seconds before the next batch.`);
        await delay(delayTime);
      } catch (error) {
        console.error(queueName, ": Error processing batch:", error.message);

        // Requeue unprocessed messages
        messagesInBatch.forEach((msg) => {
          channel.nack(msg, false, true);
          console.log(queueName, ": Nacked message:", msg.fields.deliveryTag);
        });
      }
    } else {
      if (isProductsQueue && dailyCounters[queueName] + batchSize > dailyLimit) {
        if (!limitReachedFlags[queueName]) {
          console.log(queueName, `: Daily limit of ${dailyLimit} messages reached. Switching to next API key...`);
          limitReachedFlags[queueName] = true; // Mark that the message has been shown

          switchApiKey();
          if(apiKeysFinished){
            console.log(queueName, `: API keys exhausted. Pausing until reset...`);
          }
          else{
            resetDailyCounter();
          }
        }
        await delay(1000); // Prevent busy-waiting
      } else {
        limitReachedFlags[queueName] = false; // Reset flag once processing can continue
      }

      if (messagesToProcess.length === 0 && !isQueueEmptyMessageShown[queueName]) {
        console.log(queueName, ": Queue is empty, waiting for new messages...");
        isQueueEmptyMessageShown[queueName] = true; // Display the message only once
      }
      await delay(1000); // Prevent busy-waiting while waiting for new messages
    }
  }
};

const startConsumers = async() => {
    await Promise.all([
        consumeFromQueue(SCRAPPER_QUEUE, processScrapperMessage, {batchSize: 15, delayTime: 20000}),
        consumeFromQueue(PRODUCTS_QUEUE, processArticleMessage),
    ]);
}

module.exports = { consumeFromQueue, startConsumers };