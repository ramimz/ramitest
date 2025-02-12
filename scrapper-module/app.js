const express = require("express");
const path = require("path");
const cors = require("cors");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const env = require("./config/env");
const { specs, swaggerUi } = require("./config/swagger");
const scrapeRoutes = require("./routes/scrape.routes");
const productsRoutes = require("./routes/product.routes");
const failedRoutes = require("./routes/failed.routes");
const conversionRoutes = require("./routes/conversion.routes");
const influencersRoutes = require("./routes/influencer.routes");
const brandsRoutes = require("./routes/brand.routes");
const clicksRoutes = require("./routes/click.routes");
const categoryRoutes = require("./routes/category.routes");
const subcategoryRoutes = require("./routes/subcategory.routes");
const articlesRoutes = require("./routes/articles.routes");

const app = express();
app.use(cors({
  origin: "*"
}))
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/", scrapeRoutes);
app.use("/", failedRoutes);
app.use("/p", productsRoutes);
app.use("/c", conversionRoutes);
app.use("/i", influencersRoutes);
app.use("/b", brandsRoutes);
app.use("/cl", clicksRoutes);
app.use("/cat", categoryRoutes);
app.use("/sub", subcategoryRoutes);
app.use("/a", articlesRoutes);

const PORT = env.SCRAPPER_MODULE_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const { startConsumers } = require("./rabbitmq/consumer");

// Start consuming messages from RabbitMQ queues
startConsumers();

require('./triggers/global.listener.js');

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  // Close the RabbitMQ connection and channel
  const { channel } = require("./rabbitmq/connection");
  if (channel) {
    await channel.close();
    console.log("RabbitMQ channel closed.");
  }
  process.exit(0); // Exit the process
});