const express = require("express");
const path = require("path");
const cors = require("cors");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const env = require("./config/env");
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
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.get("/home", (req, res) => {
  return res.status(200).json({
    title: "Express Testing",
    message: "The app is working properly!",
  });
});
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
